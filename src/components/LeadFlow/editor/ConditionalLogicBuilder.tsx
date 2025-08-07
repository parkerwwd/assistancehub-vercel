import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConditionalLogic, FlowStepWithFields } from '@/types/leadFlow';

interface ConditionalLogicBuilderProps {
  logic: ConditionalLogic[];
  onUpdate: (logic: ConditionalLogic[]) => void;
  availableFields: Array<{ name: string; label: string; type: string }>;
  availableSteps: Array<{ order: number; title: string }>;
}

export default function ConditionalLogicBuilder({
  logic = [],
  onUpdate,
  availableFields,
  availableSteps
}: ConditionalLogicBuilderProps) {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set([0]));

  const addRule = () => {
    const newRule: ConditionalLogic = {
      field: '',
      operator: 'equals',
      value: '',
      action: 'show'
    };
    onUpdate([...logic, newRule]);
    setExpandedRules(new Set([...expandedRules, logic.length]));
  };

  const updateRule = (index: number, updates: Partial<ConditionalLogic>) => {
    const newLogic = [...logic];
    newLogic[index] = { ...newLogic[index], ...updates };
    onUpdate(newLogic);
  };

  const deleteRule = (index: number) => {
    const newLogic = logic.filter((_, i) => i !== index);
    onUpdate(newLogic);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRules(newExpanded);
  };

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      equals: 'equals',
      notEquals: 'does not equal',
      contains: 'contains',
      greaterThan: 'is greater than',
      lessThan: 'is less than'
    };
    return labels[operator] || operator;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      show: 'Show this step',
      hide: 'Hide this step',
      skip: 'Skip to another step'
    };
    return labels[action] || action;
  };

  const getFieldType = (fieldName: string) => {
    return availableFields.find(f => f.name === fieldName)?.type || 'text';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium">Conditional Logic</h3>
        </div>
        <Button onClick={addRule} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {logic.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No conditional logic rules yet.</p>
            <p className="text-xs mt-1">Add rules to show, hide, or skip this step based on user responses.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logic.map((rule, index) => {
            const isExpanded = expandedRules.has(index);
            const field = availableFields.find(f => f.name === rule.field);
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer py-3"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                      
                      {rule.field && rule.value ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium">IF</span>
                          <Badge variant="secondary">{field?.label || rule.field}</Badge>
                          <span>{getOperatorLabel(rule.operator)}</span>
                          <Badge variant="outline">{rule.value}</Badge>
                          <span className="font-medium">THEN</span>
                          <Badge>{getActionLabel(rule.action)}</Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">New Rule (click to configure)</span>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule(index);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
                    {/* Field Selection */}
                    <div>
                      <Label>When field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateRule(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Operator Selection */}
                    <div>
                      <Label>Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(index, { operator: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="notEquals">Does not equal</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          {['number', 'date'].includes(getFieldType(rule.field)) && (
                            <>
                              <SelectItem value="greaterThan">Greater than</SelectItem>
                              <SelectItem value="lessThan">Less than</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Value Input */}
                    <div>
                      <Label>Value</Label>
                      {getFieldType(rule.field) === 'select' || getFieldType(rule.field) === 'radio' ? (
                        <Select
                          value={rule.value}
                          onValueChange={(value) => updateRule(index, { value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a value" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* In a real implementation, you'd get options from the field */}
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={getFieldType(rule.field) === 'number' ? 'number' : 'text'}
                          value={rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder={`Enter ${getFieldType(rule.field)} value`}
                        />
                      )}
                    </div>
                    
                    {/* Action Selection */}
                    <div>
                      <Label>Action</Label>
                      <Select
                        value={rule.action}
                        onValueChange={(value) => updateRule(index, { action: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show">Show this step</SelectItem>
                          <SelectItem value="hide">Hide this step</SelectItem>
                          <SelectItem value="skip">Skip to another step</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Target Step (for skip action) */}
                    {rule.action === 'skip' && (
                      <div>
                        <Label>Skip to step</Label>
                        <Select
                          value={rule.targetStep?.toString() || ''}
                          onValueChange={(value) => updateRule(index, { targetStep: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target step" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSteps.map((step) => (
                              <SelectItem key={step.order} value={step.order.toString()}>
                                Step {step.order + 1}: {step.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
      
      {logic.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Rules are evaluated in order. The first matching rule determines the action.
          </p>
        </div>
      )}
    </div>
  );
}
