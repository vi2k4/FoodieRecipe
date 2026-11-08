import { BowlFood } from "@phosphor-icons/react";

interface Props {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export default function NutritionCard({ calories, protein, fat, carbs }: Props) {
  const hasData = calories !== undefined || protein !== undefined || fat !== undefined || carbs !== undefined;
  const heading = <h2 className="text-2xl font-bold flex items-center gap-2"><BowlFood size={26} weight="duotone" className="text-green-600" aria-hidden="true" /> Dinh dưỡng</h2>;

  return (
    <section className="mt-10 rounded-2xl border border-orange-100 bg-white p-8 shadow-sm dark:border-orange-900 dark:bg-[#29211d]">
      {heading}
      {!hasData ? <p className="mt-4 text-gray-500">Chưa có thông tin dinh dưỡng.</p> : (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-950/40"><h3 className="text-sm text-gray-500 dark:text-stone-400">Calo</h3><p className="text-xl font-bold text-orange-600">{calories ?? "—"} kcal</p></div>
          <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-950/40"><h3 className="text-sm text-gray-500 dark:text-stone-400">Đạm</h3><p className="text-xl font-bold">{protein ?? "—"} g</p></div>
          <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-950/40"><h3 className="text-sm text-gray-500 dark:text-stone-400">Chất béo</h3><p className="text-xl font-bold">{fat ?? "—"} g</p></div>
          <div className="rounded-xl bg-orange-50 p-4 text-center dark:bg-orange-950/40"><h3 className="text-sm text-gray-500 dark:text-stone-400">Tinh bột</h3><p className="text-xl font-bold">{carbs ?? "—"} g</p></div>
        </div>
      )}
    </section>
  );
}
