import { load, type Action, type Keymap } from '@maga/arcade-core';
const actions=new Set<Action>(['up','down','left','right','fire','action','slot1','slot2','slot3','pause','fireUp','fireLeft','fireDown','fireRight']);
const code=/^(Key[A-Z]|Digit[0-9]|Numpad(?:[0-9]|Add|Subtract|Multiply|Divide|Decimal|Enter)|Arrow(?:Up|Down|Left|Right)|Space|Enter|Escape|Tab|Backspace|Shift(?:Left|Right)|Control(?:Left|Right)|Alt(?:Left|Right)|BracketLeft|BracketRight|Comma|Period|Slash|Semicolon|Quote|Minus|Equal)$/;
/** Saved preferences are untrusted; a corrupt value must never prevent play. */
export function loadBindings():{p1?:Keymap;p2?:Keymap}{
 const raw=load<unknown>('boxhead','keymaps',{});const result:{p1?:Keymap;p2?:Keymap}={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const player of ['p1','p2'] as const){const mapping=(raw as Record<string,unknown>)[player];if(!mapping||typeof mapping!=='object'||Array.isArray(mapping))continue;const valid:Keymap={};for(const [key,action] of Object.entries(mapping)){if(code.test(key)&&typeof action==='string'&&actions.has(action as Action))valid[key]=action as Action;}result[player]=valid;}
 return result;
}
