import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, X } from "lucide-react";

const Calculator = () => {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  const handleNum = (n: string) => {
    if (reset) { setDisplay(n); setReset(false); return; }
    setDisplay(d => d === "0" ? n : d + n);
  };

  const handleOp = (o: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op) {
      const result = calc(prev, cur, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(cur);
    }
    setOp(o);
    setReset(true);
  };

  const calc = (a: number, b: number, o: string) => {
    if (o === "+") return a + b;
    if (o === "-") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b !== 0 ? a / b : 0;
    return b;
  };

  const handleEqual = () => {
    if (prev === null || !op) return;
    const result = calc(prev, parseFloat(display), op);
    setDisplay(String(parseFloat(result.toFixed(8))));
    setPrev(null);
    setOp(null);
    setReset(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setReset(false);
  };

  const handleDot = () => {
    if (reset) { setDisplay("0."); setReset(false); return; }
    if (!display.includes(".")) setDisplay(d => d + ".");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all"
      >
        <CalcIcon className="w-5 h-5" />
      </button>
    );
  }

  const buttons = [
    ["C", "÷", "×", "-"],
    ["7", "8", "9", "+"],
    ["4", "5", "6", "="],
    ["1", "2", "3", "."],
    ["0"],
  ];

  return (
    <div className="fixed bottom-6 left-6 z-50 w-64 bg-card rounded-2xl shadow-2xl border overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 py-2 bg-primary text-primary-foreground">
        <span className="text-sm font-medium">الآلة الحاسبة</span>
        <button onClick={() => setOpen(false)} className="hover:opacity-70"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-3 text-left text-2xl font-mono bg-muted/50 truncate tabular-nums" dir="ltr">
        {display}
      </div>
      <div className="p-2 grid grid-cols-4 gap-1">
        {buttons.flat().map((btn, i) => {
          const isOp = ["÷", "×", "-", "+"].includes(btn);
          const isEqual = btn === "=";
          const isClear = btn === "C";
          const isZero = btn === "0";
          return (
            <Button
              key={i}
              variant={isOp || isEqual ? "default" : isClear ? "destructive" : "outline"}
              className={`h-10 text-base font-medium ${isZero ? "col-span-2" : ""}`}
              onClick={() => {
                if (isClear) handleClear();
                else if (isOp) handleOp(btn);
                else if (isEqual) handleEqual();
                else if (btn === ".") handleDot();
                else handleNum(btn);
              }}
            >
              {btn}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default Calculator;
