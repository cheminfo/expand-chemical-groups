import * as OCL from 'openchemlib';
import { expect, test } from 'vitest';

import { parseGroupNotation } from '../parseGroupNotation.ts';

test('an empty notation has no token', () => {
  expect(parseGroupNotation(OCL, '')).toStrictEqual([]);
  expect(parseGroupNotation(OCL, ' '.repeat(3))).toStrictEqual([]);
});

test('a peptide splits into the symbols it is written with', () => {
  expect(parseGroupNotation(OCL, 'HAlaGlyOH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Ala' },
    { symbol: 'Gly' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('nucleotides are groups like any other', () => {
  expect(parseGroupNotation(OCL, 'HODampDcmpH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'O' },
    { symbol: 'Damp' },
    { symbol: 'Dcmp' },
    { symbol: 'H' },
  ]);
});

test('an element is a symbol like any other', () => {
  expect(parseGroupNotation(OCL, 'HMe')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Me' },
  ]);
});

test('a multiplier repeats the group it follows', () => {
  expect(
    parseGroupNotation(OCL, 'Ala3').map((token) => token.symbol),
  ).toStrictEqual(['Ala', 'Ala', 'Ala']);
});

test('a multiplier repeats the parenthesis that just closed', () => {
  expect(
    parseGroupNotation(OCL, 'H(AlaGly)2OH').map((token) => token.symbol),
  ).toStrictEqual(['H', 'Ala', 'Gly', 'Ala', 'Gly', 'O', 'H']);
});

test('an unknown group is rejected', () => {
  expect(() => parseGroupNotation(OCL, 'Xyz')).toThrow(
    'unknown group in sequence: Xyz',
  );
});

test('a parenthesis after a group becomes its side chain', () => {
  expect(parseGroupNotation(OCL, 'HCysp(Ph)OH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Cysp', sideChain: 'Ph' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('each group keeps its own side chain', () => {
  expect(parseGroupNotation(OCL, 'HCysp(Ph)Cysp(Bn)OH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Cysp', sideChain: 'Ph' },
    { symbol: 'Cysp', sideChain: 'Bn' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('a repeated block carries its side chain into every copy', () => {
  expect(parseGroupNotation(OCL, 'H(Cysp(Ph))2OH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Cysp', sideChain: 'Ph' },
    { symbol: 'Cysp', sideChain: 'Ph' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('a side chain written after a repeat lands on the last copy alone', () => {
  expect(parseGroupNotation(OCL, 'HCysp2(Ph)OH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Cysp' },
    { symbol: 'Cysp', sideChain: 'Ph' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('a multiplier after a parenthesis repeats it instead of attaching it', () => {
  expect(parseGroupNotation(OCL, 'HAlaCysp(Me)2OH')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'Ala' },
    { symbol: 'Cysp' },
    { symbol: 'Me' },
    { symbol: 'Me' },
    { symbol: 'O' },
    { symbol: 'H' },
  ]);
});

test('a parenthesis after an element stays part of the chain', () => {
  expect(parseGroupNotation(OCL, 'HO(Me)')).toStrictEqual([
    { symbol: 'H' },
    { symbol: 'O' },
    { symbol: 'Me' },
  ]);
});

test('a side chain of several groups is rejected', () => {
  expect(() => parseGroupNotation(OCL, 'Cysp(AlaGly)')).toThrow(
    'the side chain (AlaGly) is not a single group',
  );
});

test('an unknown side chain is rejected', () => {
  expect(() => parseGroupNotation(OCL, 'Cysp(Xyz)')).toThrow(
    'unknown group in sequence: Xyz',
  );
});
