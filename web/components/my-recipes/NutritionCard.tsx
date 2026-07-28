interface Props {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export default function NutritionCard({
  calories,
  protein,
  fat,
  carbs,
}: Props) {
  const hasData =
    calories !== undefined ||
    protein !== undefined ||
    fat !== undefined ||
    carbs !== undefined;

  if (!hasData) {
    return (
      <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm border border-orange-100">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🥗</span> Nutrition
        </h2>
        <p className="mt-4 text-gray-500">
          No nutrition information available.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm border border-orange-100">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span>🥗</span> Nutrition
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500">Calories</h3>
          <p className="font-bold text-xl text-orange-600">
            {calories ?? "—"} kcal
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500">Protein</h3>
          <p className="font-bold text-xl">{protein ?? "—"} g</p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500">Fat</h3>
          <p className="font-bold text-xl">{fat ?? "—"} g</p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <h3 className="text-sm text-gray-500">Carbs</h3>
          <p className="font-bold text-xl">{carbs ?? "—"} g</p>
        </div>
      </div>
    </section>
  );
}
