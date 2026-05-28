import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Utensils, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { mealApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

const MEAL_TIMES = {
  cafe_da_manha: { label: 'Café da Manhã', emoji: '🌅', time: '07:00' },
  lanche_manha:  { label: 'Lanche Manhã',  emoji: '🍎', time: '10:00' },
  almoco:        { label: 'Almoço',         emoji: '🍽️', time: '12:30' },
  lanche_tarde:  { label: 'Lanche Tarde',   emoji: '🥤', time: '15:30' },
  pre_treino:    { label: 'Pré-Treino',     emoji: '⚡', time: '17:00' },
  jantar:        { label: 'Jantar',          emoji: '🌙', time: '19:30' },
  pos_treino:    { label: 'Pós-Treino',     emoji: '💪', time: '21:00' },
};

const SAMPLE_PLAN = [
  {
    id: 'sample-1',
    meal_time: 'cafe_da_manha',
    items: [
      { name: 'Aveia com banana', quantity: 80, unit: 'g', calories: 290, carbs_g: 52, protein_g: 9, fat_g: 5 },
      { name: 'Ovos mexidos', quantity: 2, unit: 'un', calories: 140, carbs_g: 1, protein_g: 12, fat_g: 10 },
      { name: 'Suco de laranja', quantity: 200, unit: 'ml', calories: 90, carbs_g: 21, protein_g: 1, fat_g: 0 },
    ],
  },
  {
    id: 'sample-2',
    meal_time: 'pre_treino',
    items: [
      { name: 'Batata-doce cozida', quantity: 150, unit: 'g', calories: 130, carbs_g: 30, protein_g: 2, fat_g: 0 },
      { name: 'Frango grelhado', quantity: 120, unit: 'g', calories: 185, carbs_g: 0, protein_g: 35, fat_g: 4 },
      { name: 'Azeite de oliva', quantity: 10, unit: 'ml', calories: 90, carbs_g: 0, protein_g: 0, fat_g: 10 },
    ],
  },
  {
    id: 'sample-3',
    meal_time: 'pos_treino',
    items: [
      { name: 'Whey protein', quantity: 30, unit: 'g', calories: 120, carbs_g: 4, protein_g: 24, fat_g: 2 },
      { name: 'Banana', quantity: 1, unit: 'un', calories: 89, carbs_g: 23, protein_g: 1, fat_g: 0 },
    ],
  },
];

function MacroBar({ carbs, protein, fat }) {
  const total = (carbs || 0) + (protein || 0) + (fat || 0);
  if (!total) return null;
  const cp = Math.round((carbs / total) * 100);
  const pp = Math.round((protein / total) * 100);
  const fp = Math.round((fat / total) * 100);
  return (
    <div className="flex rounded-full overflow-hidden h-1.5 w-full gap-px">
      <div className="bg-amber-400" style={{ width: `${cp}%` }} title={`Carboidratos ${cp}%`} />
      <div className="bg-sky-400" style={{ width: `${pp}%` }} title={`Proteínas ${pp}%`} />
      <div className="bg-rose-400" style={{ width: `${fp}%` }} title={`Gorduras ${fp}%`} />
    </div>
  );
}

function MealSection({ meal, onDelete }) {
  const [open, setOpen] = useState(true);
  const info = MEAL_TIMES[meal.meal_time] || { label: meal.meal_time, emoji: '🍴' };
  const totalCal = (meal.items || []).reduce((s, i) => s + (i.calories || 0), 0);
  const totalCarbs = (meal.items || []).reduce((s, i) => s + (i.carbs_g || 0), 0);
  const totalProt = (meal.items || []).reduce((s, i) => s + (i.protein_g || 0), 0);
  const totalFat = (meal.items || []).reduce((s, i) => s + (i.fat_g || 0), 0);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            <p className="font-bold text-sm">{info.label}</p>
            <p className="text-xs text-white/40">{info.time} · {totalCal} kcal</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-white/30" /> : <ChevronDown size={16} className="text-white/30" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {(meal.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">
                    {item.name}
                    <span className="text-white/30 text-xs ml-1">
                      {item.quantity}{item.unit}
                    </span>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">{item.calories}kcal</span>
                    <span className="text-amber-400 font-bold">{item.carbs_g}C</span>
                    <span className="text-sky-400 font-bold">{item.protein_g}P</span>
                    <span className="text-rose-400 font-bold">{item.fat_g}G</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border">
                <MacroBar carbs={totalCarbs} protein={totalProt} fat={totalFat} />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Carbs {Math.round(totalCarbs)}g</span>
                  <span>Prot {Math.round(totalProt)}g</span>
                  <span>Gord {Math.round(totalFat)}g</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function MealPlan() {
  const toast = useToast();
  const [meals, setMeals] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', quantity: '', unit: 'g', calories: '', mealTime: 'almoco' });

  useEffect(() => {
    mealApi.list()
      .then((r) => { if (r.data.length) setMeals(r.data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const isVirgin = loaded && meals.length === 0;

  const totalCal = meals.flatMap((m) => m.items || []).reduce((s, i) => s + (i.calories || 0), 0);
  const totalProt = meals.flatMap((m) => m.items || []).reduce((s, i) => s + (i.protein_g || 0), 0);
  const totalCarbs = meals.flatMap((m) => m.items || []).reduce((s, i) => s + (i.carbs_g || 0), 0);
  const totalFat = meals.flatMap((m) => m.items || []).reduce((s, i) => s + (i.fat_g || 0), 0);

  const handleAddFood = () => {
    if (!newFood.name || !newFood.mealTime) { toast('Preencha nome e refeição', 'warning'); return; }
    const item = {
      name: newFood.name,
      quantity: parseFloat(newFood.quantity) || 1,
      unit: newFood.unit,
      calories: parseFloat(newFood.calories) || 0,
      carbs_g: 0, protein_g: 0, fat_g: 0,
    };
    setMeals((prev) => {
      const exists = prev.find((m) => m.meal_time === newFood.mealTime);
      if (exists) {
        return prev.map((m) => m.meal_time === newFood.mealTime
          ? { ...m, items: [...(m.items || []), item] }
          : m);
      }
      return [...prev, { id: `new-${Date.now()}`, meal_time: newFood.mealTime, items: [item] }];
    });
    toast('Alimento adicionado!', 'success');
    setShowModal(false);
    setNewFood({ name: '', quantity: '', unit: 'g', calories: '', mealTime: 'almoco' });
  };

  return (
    <AppLayout>
      <Header title="Plano Alimentar" actions={
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>
          Adicionar
        </Button>
      } />
      <div className="page-container md:max-w-2xl">
        <div className="space-y-5">

          {/* Daily summary */}
          <Card glow>
            <p className="section-title">Resumo Diário</p>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={20} className="text-primary" />
              <p className="text-3xl font-black">{totalCal}<span className="text-lg text-white/40 font-bold ml-1">kcal</span></p>
            </div>
            <MacroBar carbs={totalCarbs} protein={totalProt} fat={totalFat} />
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Carboidratos', val: Math.round(totalCarbs), unit: 'g', color: 'text-amber-400' },
                { label: 'Proteínas',   val: Math.round(totalProt),   unit: 'g', color: 'text-sky-400' },
                { label: 'Gorduras',    val: Math.round(totalFat),    unit: 'g', color: 'text-rose-400' },
              ].map(({ label, val, unit, color }) => (
                <div key={label} className="bg-surface-2 rounded-xl p-2.5 text-center">
                  <p className={`text-xl font-black ${color}`}>{val}<span className="text-xs font-bold text-white/40">{unit}</span></p>
                  <p className="text-[10px] text-white/30">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Carboidratos</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" />Proteínas</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />Gorduras</span>
          </div>

          {/* Meals */}
          {isVirgin ? (
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Utensils size={26} className="text-white/20" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/60">Plano alimentar vazio</p>
                <p className="text-xs text-white/30 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Adicione suas refeições para acompanhar macros, calorias e timing nutricional ao longo do dia.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity"
              >
                <Plus size={13} /> Adicionar primeira refeição
              </button>
            </div>
          ) : (
            meals.map((meal) => (
              <MealSection key={meal.id} meal={meal} />
            ))
          )}
        </div>
      </div>

      {/* Add food modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Adicionar Alimento">
        <div className="space-y-4">
          <div>
            <label className="label">Refeição</label>
            <select
              className="input-field"
              value={newFood.mealTime}
              onChange={(e) => setNewFood((f) => ({ ...f, mealTime: e.target.value }))}
            >
              {Object.entries(MEAL_TIMES).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <Input label="Nome do alimento" placeholder="Ex: Arroz integral" value={newFood.name}
            onChange={(e) => setNewFood((f) => ({ ...f, name: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Quantidade" type="number" placeholder="100" value={newFood.quantity}
              onChange={(e) => setNewFood((f) => ({ ...f, quantity: e.target.value }))} />
            <div>
              <label className="label">Unidade</label>
              <select className="input-field" value={newFood.unit}
                onChange={(e) => setNewFood((f) => ({ ...f, unit: e.target.value }))}>
                {['g', 'ml', 'un', 'colher', 'xícara', 'fatia'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Calorias (kcal)" type="number" placeholder="0" value={newFood.calories}
            onChange={(e) => setNewFood((f) => ({ ...f, calories: e.target.value }))} suffix="kcal" />
          <Button variant="primary" size="xl" onClick={handleAddFood}>
            Adicionar Alimento
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
