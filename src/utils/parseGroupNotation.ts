import { parse } from 'mf-parser';

import type { OCL } from '../expandChemicalGroups.ts';

import { hasSideChainSite, isFragment } from './getFragment.ts';

export interface SequenceToken {
  /** Symbol of a `chemical-groups` group, or of a chemical element. */
  symbol: string;
  /**
   * Symbol of the group the parentheses that follow this one attach to its
   * `R3`, as the `Ph` of `Cysp(Ph)`.
   * @default undefined
   */
  sideChain?: string;
}

/** One token of the notation, as `mf-parser` returns them. */
interface MFToken {
  kind: string;
  value: string | number;
}

/** A group of the notation, with the side chain its parentheses gave it. */
interface ParsedGroup {
  symbol: string;
  sideChain?: string;
}

/**
 * What one level of parentheses collected: `symbols` is everything it holds,
 * `last` the block a multiplier applies to — the previous group, or the
 * parenthesis that just closed.
 */
interface Frame {
  symbols: ParsedGroup[];
  last: ParsedGroup[];
}

/**
 * Split a `chemical-groups` notation such as `HAlaGlyOH` or `HODampDcmpH` into
 * the groups it is made of, expanding parentheses and multipliers.
 * @param ocl - openchemlib.
 * @param notation - the group notation.
 * @returns one token per group, in order.
 */
export function parseGroupNotation(
  ocl: OCL,
  notation: string,
): SequenceToken[] {
  const trimmed = notation.trim();
  if (trimmed === '') return [];

  return expandNotation(ocl, parse(trimmed) as MFToken[]).map(
    ({ symbol, sideChain }) => {
      if (!isFragment(ocl, symbol)) {
        throw new Error(`unknown group in sequence: ${symbol}`);
      }
      if (sideChain === undefined) return { symbol };
      if (!isFragment(ocl, sideChain)) {
        throw new Error(`unknown group in sequence: ${sideChain}`);
      }
      return { symbol, sideChain };
    },
  );
}

/**
 * Repeat the block a multiplier applies to, so `H(Ala)3OH` becomes three `Ala`,
 * and hand a parenthesis that carries no multiplier to the group it follows, so
 * the `Ph` of `Cysp(Ph)` becomes that residue's side chain.
 * @param ocl - openchemlib.
 * @param tokens - the tokens `mf-parser` produced.
 * @returns the groups of the notation, in order.
 */
function expandNotation(ocl: OCL, tokens: MFToken[]): ParsedGroup[] {
  const stack: Frame[] = [{ symbols: [], last: [] }];
  for (const [index, token] of tokens.entries()) {
    const frame = stack.at(-1);
    if (frame === undefined) throw new Error('unbalanced parenthesis');
    switch (token.kind) {
      case 'atom': {
        const group = { symbol: String(token.value) };
        frame.last = [group];
        frame.symbols.push(group);
        break;
      }
      case 'openingParenthesis':
        stack.push({ symbols: [], last: [] });
        break;
      case 'closingParenthesis': {
        const closed = stack.pop();
        const parent = stack.at(-1);
        if (closed === undefined || parent === undefined) {
          throw new Error('unbalanced parenthesis');
        }
        closeParenthesis(ocl, closed.symbols, parent, tokens[index + 1]);
        break;
      }
      case 'multiplier': {
        const count = Number(token.value);
        for (let repeat = 1; repeat < count; repeat++) {
          // Cloned, so a side chain written after the repeat lands on the last
          // copy alone.
          frame.symbols.push(...frame.last.map((group) => ({ ...group })));
        }
        break;
      }
      default:
        break;
    }
  }
  if (stack.length !== 1) throw new Error('unbalanced parenthesis');
  const root = stack[0];
  if (root === undefined) throw new Error('unbalanced parenthesis');
  return root.symbols;
}

/**
 * Fold a parenthesis that just closed into the frame around it.
 *
 * A parenthesis a multiplier follows is a block to repeat, and so is one that
 * follows a symbol with no side chain site — `H(Ala)3OH` and `H(Ala)OH` both
 * write the chain itself. One that follows a triradical residue instead names
 * what hangs off it.
 * @param ocl - openchemlib.
 * @param closed - the groups the parenthesis collected.
 * @param parent - the frame the parenthesis sits in, updated in place.
 * @param parent.symbols - everything that frame holds.
 * @param parent.last - the block a multiplier there would repeat.
 * @param next - the token after the parenthesis, `undefined` at the end.
 */
function closeParenthesis(
  ocl: OCL,
  closed: ParsedGroup[],
  parent: Frame,
  next: MFToken | undefined,
) {
  const host = parent.symbols.at(-1);
  if (
    next?.kind === 'multiplier' ||
    host === undefined ||
    !hasSideChainSite(ocl, host.symbol)
  ) {
    parent.last = closed;
    parent.symbols.push(...closed);
    return;
  }
  const side = closed[0];
  if (closed.length !== 1 || side === undefined) {
    const written = closed.map((group) => group.symbol).join('');
    throw new Error(`the side chain (${written}) is not a single group`);
  }
  host.sideChain = side.symbol;
  parent.last = [host];
}
