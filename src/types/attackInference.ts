import type { AttackType } from './case';
import type { KillChainLocationState } from './killChain';

export interface AttackInferenceLocationState extends KillChainLocationState {
  /**
   * The attack type the learner selected on this page, if any.
   * Stored but not yet graded — see `AttackInference` page notes.
   */
  selectedAttackType?: AttackType;
}