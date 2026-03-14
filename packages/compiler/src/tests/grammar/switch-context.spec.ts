import { describe, expect, it } from "vitest";
import { TokenIterator } from "../../token/TokenIterator";

describe("Switch/Loop Break Context", () => {
  it("should resolve break to nearest nested breakable context", () => {
    const iterator = new TokenIterator([]);

    iterator.pushLoopContext("loop_end", "loop_continue");
    expect(iterator.getCurrentBreakLabel()).toBe("loop_end");

    iterator.pushSwitchContext("switch_end");
    expect(iterator.getCurrentBreakLabel()).toBe("switch_end");

    iterator.pushLoopContext("inner_loop_end", "inner_loop_continue");
    expect(iterator.getCurrentBreakLabel()).toBe("inner_loop_end");

    iterator.popLoopContext();
    expect(iterator.getCurrentBreakLabel()).toBe("switch_end");

    iterator.popSwitchContext();
    expect(iterator.getCurrentBreakLabel()).toBe("loop_end");
  });

  it("should keep continue bound to nearest loop only", () => {
    const iterator = new TokenIterator([]);

    iterator.pushLoopContext("loop_end", "loop_continue");
    iterator.pushSwitchContext("switch_end");

    expect(iterator.getCurrentContinueLabel()).toBe("loop_continue");
  });
});
