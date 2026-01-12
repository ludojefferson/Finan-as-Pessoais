
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category, Summary } from './types';
import { FinancialCharts } from './components/FinancialCharts';
import { getFinancialAdvice } from './services/geminiService';
import { 
  PlusIcon, 
  ArrowUpCircleIcon, 
  ArrowDownCircleIcon, 
  WalletIcon,
  SparklesIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('domus_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.HOUSING);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    localStorage.setItem('domus_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const summary = useMemo<Summary>(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) {
        acc.totalIncome += t.amount;
        acc.balance += t.amount;
      } else {
        acc.totalExpenses += t.amount;
        acc.balance -= t.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, balance: 0 });
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result || "Sem dicas no momento.");
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">DomusFinance</h1>
          </div>
          <button 
            onClick={fetchAdvice}
            disabled={loadingAdvice}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <SparklesIcon className="w-5 h-5" />
            {loadingAdvice ? 'Analisando...' : 'Pedir Dicas IA'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full">
                <ArrowUpCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Receitas</p>
                <p className="text-2xl font-bold text-slate-800">R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-full">
                <ArrowDownCircleIcon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Despesas</p>
                <p className="text-2xl font-bold text-slate-800">R$ {summary.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className={`p-6 rounded-2xl shadow-sm border ${summary.balance >= 0 ? 'bg-indigo-600 border-indigo-700' : 'bg-rose-600 border-rose-700'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-indigo-100 font-medium">Saldo Atual</p>
                <p className="text-2xl font-bold text-white">R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Advice Box */}
        {advice && (
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" /> 
              Insights do Domus AI
            </h4>
            <div className="text-indigo-800 whitespace-pre-line text-sm leading-relaxed">
              {advice}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <FinancialCharts transactions={transactions} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-lg font-semibold mb-6 text-slate-800">Nova Transação</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Descrição</label>
                  <input 
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Aluguel, Supermercado..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${type === TransactionType.INCOME ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    Receita
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${type === TransactionType.EXPENSE ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-500'}`}
                  >
                    Despesa
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center]"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors mt-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-800">Histórico de Movimentações</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <WalletIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhuma transação registrada.</p>
                    <p className="text-sm text-slate-400">Comece adicionando seus ganhos e gastos.</p>
                  </div>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.type === TransactionType.INCOME ? <ArrowUpCircleIcon className="w-5 h-5" /> : <ArrowDownCircleIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{t.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-wider">{t.category}</span>
                            <span>•</span>
                            <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <button 
                          onClick={() => deleteTransaction(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
