import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import type { DiagnosticCode } from '@/types/diagnosticCode';

interface AiSearchPanelProps {
  onClose: () => void;
  onSelectCode?: (code: DiagnosticCode) => void;
  initialQuery?: string;
}

interface AiSuggestion {
  suggestions: DiagnosticCode[];
  explanation: string;
  confidence: 'low' | 'high';
}

export function AiSearchPanel({ onClose, onSelectCode, initialQuery = '' }: AiSearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AiSuggestion | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.post(
        '/api/v1/diagnostic-codes/suggest/symptoms',
        null,
        {
          params: { symptoms: query, limit: 8 }
        }
      );
      setResult(response.data);
      
      if (response.data.suggestions.length === 0) {
        toast.info('No relevant codes found for this query');
      }
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle>AI-Powered Search</CardTitle>
              <CardDescription>
                Describe symptoms or conditions in natural language
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., chest pain radiating to left arm, frequent urination..."
            disabled={isSearching}
            autoFocus
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={result.confidence === 'high' ? 'default' : 'secondary'}>
                {result.confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
              </Badge>
              <span className="text-sm text-gray-600">
                {result.suggestions.length} code{result.suggestions.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {result.explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">{result.explanation}</p>
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Suggested Codes:</h4>
                <div className="grid gap-2">
                  {result.suggestions.map((code) => (
                    <div
                      key={code.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onSelectCode?.(code)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-600">{code.code}</span>
                            <Badge variant="outline" className="text-xs">
                              {code.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{code.description}</p>
                          {code.severity && (
                            <Badge 
                              variant={
                                code.severity === 'high' || code.severity === 'critical' 
                                  ? 'destructive' 
                                  : code.severity === 'medium' 
                                  ? 'default' 
                                  : 'secondary'
                              }
                              className="mt-2 text-xs"
                            >
                              {code.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            <strong>Examples:</strong> "chest pain radiating to left arm", "frequent urination and thirst", 
            "shortness of breath with wheezing"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
