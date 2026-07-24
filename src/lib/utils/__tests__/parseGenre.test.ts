import { describe, it, expect } from "vitest";
import { parseGenre } from "../parseGenre";

describe("parseGenre", () => {
  it("解析 PostgreSQL 数组字符串格式", () => {
    expect(parseGenre("{动作RPG,魂系,暗黑}")).toEqual(["动作RPG", "魂系", "暗黑"]);
  });

  it("解析普通逗号分隔字符串", () => {
    expect(parseGenre("动作RPG,魂系")).toEqual(["动作RPG", "魂系"]);
  });

  it("解析单个类型", () => {
    expect(parseGenre("动作")).toEqual(["动作"]);
  });

  it("空字符串返回空数组", () => {
    expect(parseGenre("")).toEqual([]);
  });

  it("undefined 返回空数组", () => {
    expect(parseGenre(undefined)).toEqual([]);
  });

  it("去除空格", () => {
    expect(parseGenre("{ 动作RPG , 魂系 }")).toEqual(["动作RPG", "魂系"]);
  });

  it("过滤空值", () => {
    expect(parseGenre("{动作RPG,,魂系,}")).toEqual(["动作RPG", "魂系"]);
  });
});
