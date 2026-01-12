
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Category {
  HOUSING = 'Moradia',
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HEALTH = 'Saúde',
  EDUCATION = 'Educação',
  LEISURE = 'Lazer',
  SALARY = 'Salário',
  INVESTMENT = 'Investimento',
  OTHERS = 'Outros'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
