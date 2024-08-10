import { getKeywordById } from '../../utils/keywords';
import { CardAction, noop } from './_card-action';

export class RemoveKeywordCardActon extends CardAction<'remove_keyword'> {
  protected async executeImpl() {
    const targets = this.getUnits(this.action.params.unit);
    await Promise.all(
      targets.map(entity => {
        entity.removeKeyword(getKeywordById(this.action.params.keyword)!);
        entity.removeModifier(this.action.params.keyword);
      })
    );

    return noop;
  }
}
