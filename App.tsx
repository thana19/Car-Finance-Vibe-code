import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { searchCars, CarInfo } from './services/geminiService';
import Card from './components/Card';
import Button from './components/Button';
import SearchIcon from './components/icons/SearchIcon';
import CalculatorIcon from './components/icons/CalculatorIcon';
import CarResultCard from './components/CarResultCard';
import HistoryIcon from './components/icons/HistoryIcon';
import ShareIcon from './components/icons/ShareIcon';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CarInfo[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [carPrice, setCarPrice] = useState<string>('');
  const [downPayment, setDownPayment] = useState<string>('');
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>('25');
  const [interestRate, setInterestRate] = useState<string>('5');
  const [loanTerm, setLoanTerm] = useState<number>(5);
  
  const [monthlyInstallment, setMonthlyInstallment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [financedAmount, setFinancedAmount] = useState<number | null>(null);
  const [calculatedDownPayment, setCalculatedDownPayment] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);


  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem('recentCarSearches');
      if (storedSearches) {
        const parsedSearches = JSON.parse(storedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches);
        }
      }
    } catch (error) {
      console.error('Failed to parse recent searches from localStorage', error);
      localStorage.removeItem('recentCarSearches');
    }
  }, []);

  const downPaymentAmount = useMemo(() => {
    return parseFloat(downPayment) || 0;
  }, [downPayment]);

  const resetCalculationResults = useCallback(() => {
    setMonthlyInstallment(null);
    setTotalInterest(null);
    setTotalPayment(null);
    setFinancedAmount(null);
    setCalculatedDownPayment(null);
    setShareStatus(null);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchError('กรุณาป้อนรุ่นรถที่ต้องการค้นหา');
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    resetCalculationResults();
    setSearchResults([]);

    try {
      const results = await searchCars(query);
       if (results.length === 0) {
        setSearchError('ไม่พบรถยนต์ที่ตรงกับคำค้นหาของคุณ');
      } else {
        setSearchResults(results);
        setRecentSearches(prevSearches => {
            const normalizedQuery = query.trim();
            const filteredSearches = prevSearches.filter(s => s.toLowerCase() !== normalizedQuery.toLowerCase());
            const updatedSearches = [normalizedQuery, ...filteredSearches];
            const limitedSearches = updatedSearches.slice(0, 5);
            localStorage.setItem('recentCarSearches', JSON.stringify(limitedSearches));
            return limitedSearches;
        });
      }
    } catch (error: any) {
      console.error(error);
      setSearchError(error.message || 'ไม่สามารถค้นหาราคารถได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSearching(false);
    }
  }, [resetCalculationResults]);

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleCarSelect = useCallback((price: number) => {
    const priceStr = price.toString();
    setCarPrice(priceStr);
    resetCalculationResults();
    
    const percent = parseFloat(downPaymentPercent);
    if (!isNaN(percent) && percent >= 0) {
        const amount = (price * percent) / 100;
        setDownPayment(amount.toFixed(0));
    }

    setSearchResults([]);
    const calculatorElement = document.getElementById('calculator-section');
    calculatorElement?.scrollIntoView({ behavior: 'smooth' });
  }, [downPaymentPercent, resetCalculationResults]);

  const handleCalculateClick = useCallback(() => {
    const price = parseFloat(carPrice);
    const interest = parseFloat(interestRate);

    if (isNaN(price) || price <= 0) {
      alert('กรุณาป้อนราคารถที่ถูกต้อง');
      return;
    }
    if(downPaymentAmount >= price) {
      alert('จำนวนเงินดาวน์ต้องน้อยกว่าราคารถ');
      return;
    }
    if (isNaN(interest) || interest < 0) {
      alert('กรุณาป้อนอัตราดอกเบี้ยที่ถูกต้อง');
      return;
    }
    
    const principal = price - downPaymentAmount;
    const monthlyInterestRate = interest / 100 / 12;
    const numberOfMonths = loanTerm * 12;

    if (monthlyInterestRate === 0) {
        const installment = principal / numberOfMonths;
        setMonthlyInstallment(installment);
        setTotalInterest(0);
        setTotalPayment(principal);
        setFinancedAmount(principal);
        setCalculatedDownPayment(downPaymentAmount);
    } else {
        const installment =
        (principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths))) /
        (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
        
        const totalPaid = installment * numberOfMonths;
        const totalInterestPaid = totalPaid - principal;
        
        setMonthlyInstallment(installment);
        setTotalInterest(totalInterestPaid);
        setTotalPayment(totalPaid);
        setFinancedAmount(principal);
        setCalculatedDownPayment(downPaymentAmount);
    }
  }, [carPrice, downPaymentAmount, interestRate, loanTerm]);
  
  const handleCarPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const priceValue = e.target.value;
    setCarPrice(priceValue);
    resetCalculationResults();
    
    const price = parseFloat(priceValue);
    const percent = parseFloat(downPaymentPercent);

    if (!isNaN(price) && price > 0 && !isNaN(percent) && percent >= 0) {
        const amount = (price * percent) / 100;
        setDownPayment(amount.toFixed(0));
    } else {
        setDownPayment('');
    }
  };

  const handleDownPaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const amountValue = e.target.value;
      setDownPayment(amountValue);
      resetCalculationResults();

      const price = parseFloat(carPrice);
      const amount = parseFloat(amountValue);

      if (!isNaN(price) && price > 0 && !isNaN(amount) && amount >= 0) {
          const percent = (amount / price) * 100;
          setDownPaymentPercent(percent.toFixed(2).replace(/\.00$/, '')); 
      } else {
          setDownPaymentPercent('');
      }
  };

  const handleDownPaymentPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const percentValue = e.target.value;
      setDownPaymentPercent(percentValue);
      resetCalculationResults();

      const price = parseFloat(carPrice);
      const percent = parseFloat(percentValue);

      if (!isNaN(price) && price > 0 && !isNaN(percent) && percent >= 0) {
          const amount = (price * percent) / 100;
          setDownPayment(amount.toFixed(0));
      } else {
          setDownPayment('');
      }
  };

  const formatCurrency = (value: number | null, digits: number = 2) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('th-TH', { 
        minimumFractionDigits: digits, 
        maximumFractionDigits: digits 
    }).format(value);
  }

  const handleShare = async () => {
    if (monthlyInstallment === null) return;

    const summaryText = `
ผลการคำนวณไฟแนนซ์รถยนต์:
- ราคารถ: ${formatCurrency(parseFloat(carPrice), 0)} บาท
- เงินดาวน์: ${formatCurrency(calculatedDownPayment, 0)} บาท
- ยอดจัดไฟแนนซ์: ${formatCurrency(financedAmount, 0)} บาท
- ระยะเวลาผ่อนชำระ: ${loanTerm} ปี
- อัตราดอกเบี้ย: ${interestRate}% ต่อปี
- ค่างวดต่อเดือน: ${formatCurrency(monthlyInstallment, 2)} บาท
- ดอกเบี้ยทั้งหมด: ${formatCurrency(totalInterest, 2)} บาท
- ยอดชำระทั้งหมด: ${formatCurrency(totalPayment, 2)} บาท
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ผลการคำนวณไฟแนนซ์รถยนต์',
          text: summaryText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(summaryText);
        setShareStatus('คัดลอกผลลัพธ์แล้ว!');
        setTimeout(() => setShareStatus(null), 3000);
      } catch (err) {
        console.error('Failed to copy: ', err);
        setShareStatus('ไม่สามารถคัดลอกได้');
        setTimeout(() => setShareStatus(null), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500">
            คำนวณไฟแนนซ์รถยนต์
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">พร้อม AI ช่วยค้นหาราคารถยนต์</p>
        </header>

        <Card>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <SearchIcon className="w-7 h-7 text-blue-500" />
              ค้นหาราคารถด้วย AI
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              ไม่แน่ใจราคารถ? พิมพ์ชื่อรุ่นรถ (เช่น "Toyota Yaris Ativ") แล้วให้ AI ช่วยค้นหาราคาประเมินให้คุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="เช่น Toyota Camry, Honda Civic"
                className="flex-grow w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              <Button onClick={() => handleSearch(searchQuery)} disabled={isSearching} className="w-full sm:w-auto">
                {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
            </div>
            {searchError && <p className="text-red-500 mt-2">{searchError}</p>}
            
            {recentSearches.length > 0 && !isSearching && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                  <HistoryIcon className="w-5 h-5" />
                  การค้นหาล่าสุด
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((query) => (
                    <button
                      key={query}
                      onClick={() => handleRecentSearchClick(query)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-sm rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      aria-label={`Search for ${query}`}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {searchResults.length > 0 && (
            <div className="my-8">
                <h2 className="text-2xl font-semibold mb-4 text-center">ผลการค้นหา</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((car, index) => (
                    <CarResultCard key={index} car={car} onSelect={handleCarSelect} />
                    ))}
                </div>
            </div>
        )}
        
        <div id="calculator-section" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <Card>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <CalculatorIcon className="w-7 h-7 text-blue-500" />
                            ข้อมูลสำหรับคำนวณ
                        </h2>
                        
                        <div>
                            <label htmlFor="car-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ราคารถยนต์ (บาท)</label>
                            <input id="car-price" type="number" placeholder="0.00" value={carPrice} onChange={handleCarPriceChange} className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">เงินดาวน์</label>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">เปอร์เซ็นต์</span>
                                        <span className="px-3 py-1 text-sm font-bold text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-full">
                                            {parseFloat(downPaymentPercent || '0').toFixed(0)}%
                                        </span>
                                    </div>
                                    <input
                                        id="down-payment-percent"
                                        type="range"
                                        min="0"
                                        max="80"
                                        step="1"
                                        value={downPaymentPercent || '0'}
                                        onChange={handleDownPaymentPercentChange}
                                        className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="down-payment" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">จำนวนเงิน</label>
                                    <div className="relative">
                                        <input id="down-payment" type="number" placeholder="0.00" value={downPayment} onChange={handleDownPaymentAmountChange} className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 dark:text-gray-400 pointer-events-none">บาท</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อัตราดอกเบี้ยต่อปี (%)</label>
                            <input id="interest-rate" type="number" placeholder="5.0" value={interestRate} onChange={e => {setInterestRate(e.target.value); resetCalculationResults();}} step="0.01" className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ระยะเวลาผ่อนชำระ (ปี)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[4, 5, 6, 7].map(year => (
                                    <button key={year} onClick={() => {setLoanTerm(year); resetCalculationResults();}} className={`py-3 rounded-lg transition ${loanTerm === year ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                        {year} ปี
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleCalculateClick} className="w-full text-lg py-3">
                            คำนวณค่างวด
                        </Button>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 text-white h-full flex flex-col">
                    <div className="space-y-6 flex-grow">
                        <h2 className="text-2xl font-semibold">ผลการคำนวณ</h2>
                        
                        <div className="text-center space-y-2 py-6 border-y-2 border-blue-400/50 dark:border-blue-500/50">
                            <p className="text-lg opacity-80">ค่างวดต่อเดือน</p>
                            <p className="text-5xl font-bold tracking-tight">
                                {formatCurrency(monthlyInstallment, 2)}
                            </p>
                            <p className="opacity-80">บาท</p>
                        </div>
                        
                        <div className="space-y-4 text-lg">
                            <div className="flex justify-between">
                                <span className="opacity-80">ราคารถ:</span>
                                <span>{formatCurrency(monthlyInstallment !== null && carPrice ? parseFloat(carPrice) : null, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">เงินดาวน์:</span>
                                <span>{formatCurrency(calculatedDownPayment, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">ยอดจัดไฟแนนซ์:</span>
                                <span>{formatCurrency(financedAmount, 2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">อัตราดอกเบี้ย:</span>
                                <span>{interestRate}% ต่อปี</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">ระยะเวลาผ่อนชำระ:</span>
                                <span>{loanTerm} ปี</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">ดอกเบี้ยทั้งหมด:</span>
                                <span>{formatCurrency(totalInterest, 2)}</span>
                            </div>
                             <div className="flex justify-between font-semibold">
                                <span className="opacity-80">ยอดชำระทั้งหมด:</span>
                                <span>{formatCurrency(totalPayment, 2)}</span>
                            </div>
                        </div>
                    </div>
                     {monthlyInstallment !== null && (
                      <div className="mt-6 pt-6 border-t border-blue-400/50 dark:border-blue-500/50">
                        <Button
                          onClick={handleShare}
                          className="w-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center gap-2"
                        >
                          <ShareIcon className="w-5 h-5" />
                          แชร์ผลลัพธ์
                        </Button>
                        {shareStatus && (
                            <p className="text-center text-sm mt-3 text-white/90 animate-pulse">{shareStatus}</p>
                        )}
                      </div>
                    )}
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
