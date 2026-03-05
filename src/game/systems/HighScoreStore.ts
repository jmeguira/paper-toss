import { DifficultyId } from "../constants";

const STORAGE_KEY = "paperToss.highScores";

type ScoreData = Partial<Record<DifficultyId, number>>;

export class HighScoreStore {
  private data: ScoreData;

  constructor() {
    this.data = this.load();
  }

  get(id: DifficultyId): number {
    return this.data[id] ?? 0;
  }

  /** Update best streak if higher. Returns true if a new record was set. */
  submit(id: DifficultyId, streak: number): boolean {
    const prev = this.get(id);
    if (streak <= prev) return false;
    this.data[id] = streak;
    this.save();
    return true;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }

  private load(): ScoreData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return {};
      // Validate: keep only known keys with numeric values
      const result: ScoreData = {};
      for (const key of ["EASY", "MEDIUM", "HARD"] as DifficultyId[]) {
        const val = (parsed as Record<string, unknown>)[key];
        if (typeof val === "number" && val >= 0 && isFinite(val)) {
          result[key] = val;
        }
      }
      return result;
    } catch {
      return {};
    }
  }
}
