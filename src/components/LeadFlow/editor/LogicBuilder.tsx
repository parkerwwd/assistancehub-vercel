import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type LogicCondition = {
  sourceId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: string;
};

type LogicRule = {
  target: { scope: 'field' | 'step'; id: string };
  action: 'show' | 'hide' | 'enable' | 'disable';
  conditions: LogicCondition[];
  join: 'AND' | 'OR';
};

interface LogicBuilderProps {
  value: LogicRule[];
  onChange: (rules: LogicRule[]) => void;
  steps: Array<{ id?: string; tempId?: string; title?: string; step_type: string } & Record<string, any>>;
}

const emptyRule: LogicRule = {
  target: { scope: 'step', id: '' },
  action: 'show',
  conditions: [{ sourceId: '', operator: 'equals', value: '' }],
  join: 'AND',
};

export default function LogicBuilder({ value, onChange, steps }: LogicBuilderProps) {
  const rules = value || [];

  const updateRule = (idx: number, patch: Partial<LogicRule>) => {
    const next = [...rules];
    next[idx] = { ...next[idx], ...patch } as LogicRule;
    onChange(next);
  };

  const updateCondition = (rIdx: number, cIdx: number, patch: Partial<LogicCondition>) => {
    const next = [...rules];
    const rule = { ...next[rIdx] } as LogicRule;
    const conditions = [...rule.conditions];
    conditions[cIdx] = { ...conditions[cIdx], ...patch } as LogicCondition;
    rule.conditions = conditions;
    next[rIdx] = rule;
    onChange(next);
  };

  const addRule = () => onChange([...(rules || []), { ...emptyRule }]);
  const removeRule = (idx: number) => onChange(rules.filter((_, i) => i !== idx));
  const addCondition = (idx: number) => updateRule(idx, { conditions: [...rules[idx].conditions, { sourceId: '', operator: 'equals', value: '' }] });
  const removeCondition = (rIdx: number, cIdx: number) => updateRule(rIdx, { conditions: rules[rIdx].conditions.filter((_, i) => i !== cIdx) });

  const stepOptions = steps.map((s, i) => ({ id: (s.id || s.tempId || `${i}`) as string, label: s.title || `${s.step_type} ${i + 1}` }));

  return (
    <div className="space-y-4">
      {rules.map((rule, rIdx) => (
        <Card key={rIdx}>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-700">Target</label>
                <div className="flex gap-2">
                  <Select value={rule.target.scope} onValueChange={(v: any) => updateRule(rIdx, { target: { ...rule.target, scope: v } })}>
                    <SelectTrigger><SelectValue placeholder="Scope" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="step">Step</SelectItem>
                      <SelectItem value="field">Field</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={rule.target.id} onValueChange={(v: any) => updateRule(rIdx, { target: { ...rule.target, id: v } })}>
                    <SelectTrigger><SelectValue placeholder="Select target" /></SelectTrigger>
                    <SelectContent>
                      {stepOptions.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Action</label>
                <Select value={rule.action} onValueChange={(v: any) => updateRule(rIdx, { action: v })}>
                  <SelectTrigger><SelectValue placeholder="Action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Show</SelectItem>
                    <SelectItem value="hide">Hide</SelectItem>
                    <SelectItem value="enable">Enable</SelectItem>
                    <SelectItem value="disable">Disable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-700">Join</label>
                <Select value={rule.join} onValueChange={(v: any) => updateRule(rIdx, { join: v })}>
                  <SelectTrigger><SelectValue placeholder="Join" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => addCondition(rIdx)}>Add Condition</Button>
                <Button variant="destructive" onClick={() => removeRule(rIdx)}>Remove Rule</Button>
              </div>
            </div>

            <div className="space-y-3">
              {rule.conditions.map((cond, cIdx) => (
                <div key={cIdx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <div>
                    <label className="text-sm text-gray-700">Source Field ID</label>
                    <Input value={cond.sourceId} onChange={(e) => updateCondition(rIdx, cIdx, { sourceId: e.target.value })} placeholder="field id" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Operator</label>
                    <Select value={cond.operator} onValueChange={(v: any) => updateCondition(rIdx, cIdx, { operator: v })}>
                      <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="gt">greater than</SelectItem>
                        <SelectItem value="lt">less than</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Value</label>
                    <Input value={cond.value} onChange={(e) => updateCondition(rIdx, cIdx, { value: e.target.value })} placeholder="value" />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" onClick={() => removeCondition(rIdx, cIdx)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div>
        <Button onClick={addRule}>Add Rule</Button>
      </div>
    </div>
  );
}


