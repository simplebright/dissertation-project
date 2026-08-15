import type { AttackType } from '../types/case';
import { isRecord } from './guards';
import type { AttackInferenceLocationState } from '../types/attackInference';
import { isKillChainLocationState } from './killChainState';

const ATTACK_TYPES: AttackType[] = [
  'Phishing',
  'Malware Download',
  'Credential Theft',
  'Benign Activity',
];

export function isAttackType(value: unknown): value is AttackType {
  return typeof value === 'string' && (ATTACK_TYPES as string[]).includes(value);
}

export function isAttackInferenceLocationState(
  state: unknown,
): state is AttackInferenceLocationState {
  return (
    isRecord(state) &&
    isKillChainLocationState(state) &&
    (state.selectedAttackType === undefined ||
      isAttackType(state.selectedAttackType))
  );
}