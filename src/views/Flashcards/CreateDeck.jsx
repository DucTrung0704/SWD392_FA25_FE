import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashcardService } from '../../services/flashcardService';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CreateDeck() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deck, setDeck] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    tags: [],
    isPublic: true,
    cards: []
  });
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    explanation: ''
  });
  const [newTag, setNewTag] = useState('');

  const handleDeckChange = (field, value) => {
    setDeck(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardChange = (field, value) => {
    setNewCard(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCard = () => {
    if (newCard.question.trim() && newCard.answer.trim()) {
      setDeck(prev => ({
        ...prev,
        cards: [...prev.cards, { ...newCard, id: Date.now().toString() }]
      }));
      setNewCard({ question: '', answer: '', explanation: '' });
    }
  };

  const removeCard = (index) => {
    setDeck(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !deck.tags.includes(newTag.trim())) {
      setDeck(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setDeck(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!deck.title.trim() || deck.cards.length === 0) {
      alert('Please add a title and at least one card');
      return;
    }
    setLoading(true);
    try {
      await flashcardService.createDeck(deck);
      navigate('/flashcards');
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Deck Info', description: 'Basic information about your deck' },
    { number: 2, title: 'Add Cards', description: 'Create flashcards for your deck' },
    { number: 3, title: 'Review', description: 'Preview and publish your deck' }
  ];

  return (
    <Container className="min-h-screen py-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Create New Deck
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Build your own flashcard collection to share with others
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-300 ${
                    step === stepItem.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step > stepItem.number
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
                  }`}
                >
                  {step > stepItem.number ? '✓' : stepItem.number}
                </div>
                <div className="ml-4">
                  <div className={`font-semibold ${
                    step >= stepItem.number ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {stepItem.title}
                  </div>
                  <div className="text-sm text-gray-500">{stepItem.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      step > stepItem.number ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Deck Information
            </h2>
            <div className="space-y-6">
              <Input
                label="Deck Title"
                value={deck.title}
                onChange={(e) => handleDeckChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your deck"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={deck.description}
                  onChange={(e) => handleDeckChange('description', e.target.value)}
                  placeholder="Describe what this deck covers..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={deck.category}
                    onChange={(e) => handleDeckChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="language">Language</option>
                    <option value="science">Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="history">History</option>
                    <option value="programming">Programming</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={deck.difficulty}
                    onChange={(e) => handleDeckChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button type="button" onClick={addTag} className="bg-blue-600 hover:bg-blue-700 text-white">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deck.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-600">×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <input type="checkbox" checked={deck.isPublic} onChange={(e) => handleDeckChange('isPublic', e.target.checked)} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                <label className="text-sm text-gray-700 dark:text-gray-300">Make this deck public (visible to all users)</label>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button onClick={() => setStep(2)} disabled={!deck.title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">Next: Add Cards →</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Flashcards</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Card</h3>
              <div className="space-y-4">
                <Input label="Question" value={newCard.question} onChange={(e) => handleCardChange('question', e.target.value)} placeholder="Enter the question or term" required />
                <Input label="Answer" value={newCard.answer} onChange={(e) => handleCardChange('answer', e.target.value)} placeholder="Enter the answer or definition" required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Explanation (Optional)</label>
                  <textarea value={newCard.explanation} onChange={(e) => handleCardChange('explanation', e.target.value)} placeholder="Additional explanation or context..." rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <Button onClick={addCard} disabled={!newCard.question.trim() || !newCard.answer.trim()} className="bg-green-600 hover:bg-green-700 text-white">+ Add Card</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cards in Deck ({deck.cards.length})</h3>
              {deck.cards.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No cards added yet. Start by adding your first card above.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {deck.cards.map((card, index) => (
                    <div key={card.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm flex items-center justify-center mt-1">{index + 1}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{card.question}</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{card.answer}</p>
                            {card.explanation && (<p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{card.explanation}</p>)}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeCard(index)} className="text-red-500 hover:text-red-700 p-1">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(1)} className="border-gray-300 dark:border-gray-600">← Back</Button>
              <Button onClick={() => setStep(3)} disabled={deck.cards.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">Next: Review Deck →</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Review Your Deck</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deck Summary</h3>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Title:</span><span className="font-semibold text-gray-900 dark:text-white">{deck.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Cards:</span><span className="font-semibold text-gray-900 dark:text-white">{deck.cards.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Category:</span><span className="font-semibold text-gray-900 dark:text-white">{deck.category || 'Not specified'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Difficulty:</span><span className="font-semibold text-gray-900 dark:text-white capitalize">{deck.difficulty}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Visibility:</span><span className="font-semibold text-gray-900 dark:text-white">{deck.isPublic ? 'Public' : 'Private'}</span></div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Preview</h3>
                {deck.cards.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-center">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">QUESTION</div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{deck.cards[0].question}</h4>
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">ANSWER</div>
                      <p className="text-gray-700 dark:text-gray-300">{deck.cards[0].answer}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {deck.tags.map(tag => (<span key={tag} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">{tag}</span>))}
                {deck.tags.length === 0 && (<span className="text-gray-500 dark:text-gray-400">No tags added</span>)}
              </div>
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(2)} className="border-gray-300 dark:border-gray-600">← Back to Cards</Button>
              <Button onClick={handleSubmit} disabled={loading || !deck.title.trim() || deck.cards.length === 0} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Creating Deck...</div>) : ('🎉 Create Deck')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}


