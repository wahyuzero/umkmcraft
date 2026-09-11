/**
 * Test komposisi balasan intake (P0: re-ask tidak boleh terbaca sebagai loop):
 * - pertanyaan pertama mempertahankan copy lama,
 * - re-ask memakai kalimat BERBEDA + pengakuan slot baru yang tertangkap,
 * - asked-counts terekonstruksi dari riwayat, intakeTurn ujung-ke-ujung konsisten.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { streamText } from "ai";
import {
  composeIntakeReply,
  deterministicIntakeReply,
  emptySlots,
  intakeTurn,
  mergeSlots,
  newlyCapturedKeys,
  replayAskedCounts,
} from "../src/index";

// Paksa jalur deterministik (tanpa key) — jalur itulah yang menyusun balasan sendiri.
beforeEach(() => {
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

// Mock "ai" — jalur AI hanya memakai streamText; describe di bawah yang
// mengatur balasannya, describe lain tak pernah menyentuhnya (key kosong).
vi.mock("ai", () => ({ streamText: vi.fn() }));

/** Pasang balasan AI palsu untuk satu giliran (dikumpulkan utuh oleh intakeTurn). */
function fakeAiReply(text: string) {
  const textStream = (async function* () {
    yield text;
  })();
  vi.mocked(streamText).mockResolvedValue({ textStream } as never);
}

const FIRST_WA_ASK =
  "Oke dicatat! Sekarang yang paling penting: **nomor WhatsApp** untuk menerima pesanan pembeli, kakak? (contoh: 0812-3456-7890)";

describe("composeIntakeReply — pertanyaan pertama mempertahankan copy lama", () => {
  it("ask WA pertama kali: kalimat persis seperti semula", () => {
    const slots = { ...emptySlots(), businessName: "Warung Sambal Bule", category: "kuliner" };
    expect(deterministicIntakeReply(slots)).toBe(FIRST_WA_ASK);
    expect(composeIntakeReply(slots)).toBe(FIRST_WA_ASK);
  });

  it("semua slot wajib lengkap: arahkan ke tombol besar (bukan 'tulis di sini')", () => {
    const slots = {
      ...emptySlots(),
      businessName: "Warung Sambal Bule",
      category: "kuliner",
      whatsappNumber: "6281234567890",
    };
    const reply = composeIntakeReply(slots);
    expect(reply).toContain("Buat Website Saya");
    expect(reply).not.toContain("tulis di sini");
  });
});

describe("composeIntakeReply — re-ask bukan echo copy-paste", () => {
  const prev = { ...emptySlots(), businessName: "Warung Sambal Bule", category: "kuliner" };
  const next = mergeSlots(prev, "Buka tiap hari jam 9 pagi sampai 4 sore, di Kota Baru Bandung");

  it("re-ask WA: kalimat berbeda dari ask pertama", () => {
    const reAsk = composeIntakeReply(next, { whatsappNumber: 1 }, prev);
    expect(reAsk).not.toBe(FIRST_WA_ASK);
    expect(reAsk).not.toContain("Oke dicatat!");
    expect(reAsk).toContain("nomor WhatsApp");
  });

  it("pengakuan menyebut slot yang baru tertangkap (jam buka dan lokasi)", () => {
    const reAsk = composeIntakeReply(next, { whatsappNumber: 1 }, prev);
    expect(reAsk).toContain("Siip, jam buka dan lokasi tercatat.");
    expect(next.hours).toBeTruthy();
    expect(next.location).toBeTruthy();
  });

  it("re-ask tanpa slot baru: tetap varian berbeda, tanpa 'tercatat' kosong", () => {
    const reAsk = composeIntakeReply(next, { whatsappNumber: 2 }, next);
    expect(reAsk).not.toContain("tercatat");
    expect(reAsk).not.toBe(FIRST_WA_ASK);
  });

  it("ask berulang memutar varian: tak pernah balik ke copy pertama, selalu beda dari sebelumnya", () => {
    const ask1 = composeIntakeReply(next, { whatsappNumber: 1 }, prev);
    const ask2 = composeIntakeReply(next, { whatsappNumber: 2 }, prev);
    const ask3 = composeIntakeReply(next, { whatsappNumber: 3 }, prev);
    expect(ask1).not.toBe(FIRST_WA_ASK);
    expect(ask2).not.toBe(ask1);
    expect(ask3).not.toBe(ask2);
    expect(ask1).not.toContain("Oke dicatat!");
    expect(ask3).not.toContain("Oke dicatat!");
  });

  it("re-ask nama usaha juga punya varian berbeda", () => {
    const onlyProducts = mergeSlots(emptySlots(), "menu: sambal 15000, ayam geprek 18000");
    const firstAsk = composeIntakeReply(onlyProducts);
    const reAsk = composeIntakeReply(onlyProducts, { businessName: 1 }, emptySlots());
    expect(firstAsk).toContain("nama usahanya apa");
    expect(reAsk).not.toBe(firstAsk);
  });

  it("pengakuan produk berharga membaca 'menu dan harga'", () => {
    const withMenu = mergeSlots(emptySlots(), "nama usahaku Sambal Ndeso, menu: sambal 15000");
    const reAsk = composeIntakeReply(withMenu, { whatsappNumber: 1 }, emptySlots());
    expect(reAsk).toContain("Siip, nama usaha, jenis usaha, menu dan harga tercatat.");
  });
});

describe("replayAskedCounts — rekonstruksi dari riwayat", () => {
  it("giliran pertama belum menanya apa pun; giliran berikutnya terhitung", () => {
    const counts = replayAskedCounts([
      { role: "user", content: "Warung Sambal Bule, jualan sambal kemasan" },
      { role: "assistant", content: FIRST_WA_ASK },
      { role: "user", content: "buka tiap hari jam 9 pagi, di Kota Baru Bandung" },
    ]);
    expect(counts).toEqual({ whatsappNumber: 1 });
  });

  it("nama tertanya berulang selama belum diisi", () => {
    const counts = replayAskedCounts([
      { role: "user", content: "menu: sambal 15000" },
      { role: "assistant", content: "?" },
      { role: "user", content: "hudjdhdu" },
      { role: "assistant", content: "?" },
      { role: "user", content: "hudjdhdu" },
    ]);
    expect(counts).toEqual({ businessName: 2 });
  });
});

describe("newlyCapturedKeys — diff slot prev vs next", () => {
  it("hanya slot yang benar-benar baru dilaporkan", () => {
    const prev = { ...emptySlots(), businessName: "Warung Sambal Bule" };
    const next = mergeSlots(prev, "kategorinya kuliner, buka jam 9 pagi");
    expect(newlyCapturedKeys(prev, next)).toEqual(["category", "hours"]);
    expect(newlyCapturedKeys(next, next)).toEqual([]);
  });
});

describe("intakeTurn — jalur AI: balasan tanpa pengakuan diberi awalan", () => {
  const USER = "Buka tiap hari jam 9 pagi sampai 4 sore";

  beforeEach(() => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-key");
  });

  it("AI bertanya tanpa mengakui slot baru → awalan 'Siip, jam buka tercatat.'", async () => {
    fakeAiReply("Cerita dulu dong, kakak: nama usahanya apa dan jualan apa aja?");
    const turn = await intakeTurn([{ role: "user", content: USER }], emptySlots());
    expect(turn.reply).toMatch(/^Siip, jam buka tercatat\. /);
    expect(turn.reply).toContain("Cerita dulu dong");
  });

  it("AI sudah menyebut 'tercatat' → balasan dibiarkan utuh", async () => {
    const ai = "Siip, jam buka kakak tercatat. Sekarang kategorinya apa, kak?";
    fakeAiReply(ai);
    const turn = await intakeTurn([{ role: "user", content: USER }], emptySlots());
    expect(turn.reply).toBe(ai);
  });

  it("AI dibuka sapaan setuju ('Siap') → dianggap sudah mengakui", async () => {
    const ai = "Siap, kakak! Kategorinya apa nih?";
    fakeAiReply(ai);
    const turn = await intakeTurn([{ role: "user", content: USER }], emptySlots());
    expect(turn.reply).toBe(ai);
  });
});

describe("intakeTurn — dua giliran ujung-ke-ujung (repro loop)", () => {
  it("giliran kedua mengakui jam buka + lokasi dan TIDAK mengulang kalimat pertama", async () => {
    const history1 = [
      { role: "user" as const, content: "Warung sambal bule, jual sambal kemasan dan ayam geprek" },
    ];
    const turn1 = await intakeTurn(history1, emptySlots());
    expect(turn1.slots.businessName).toBeTruthy();
    expect(turn1.nextAction).toBe("ask");

    const history2 = [
      ...history1,
      { role: "assistant" as const, content: turn1.reply },
      {
        role: "user" as const,
        content: "Buka tiap hari jam 9 pagi sampai 4 sore, di Kota Baru Bandung",
      },
    ];
    const turn2 = await intakeTurn(history2, turn1.slots);
    expect(turn2.slots.hours).toBeTruthy();
    expect(turn2.slots.location).toBeTruthy();
    expect(turn2.reply).not.toBe(turn1.reply);
    expect(turn2.reply).toContain("Siip, jam buka dan lokasi tercatat.");
    expect(turn2.reply).not.toContain("Oke dicatat!");
    expect(turn2.nextAction).toBe("ask");
  });
});
