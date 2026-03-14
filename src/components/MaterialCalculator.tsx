import { useState } from 'react';
import { Ruler, Package, Info } from 'lucide-react';

interface MaterialEstimate {
  name: string;
  unit: string;
  formula: (sqft: number, wallHeight: number) => number;
  notes: string;
  category: string;
}

const MATERIALS: MaterialEstimate[] = [
  // Framing
  {
    name: '2x4 Studs (walls)',
    unit: 'pieces',
    formula: (sqft, wallHeight) => {
      const perimeter = Math.sqrt(sqft) * 4;
      const studsPerFoot = 1; // 16" OC ≈ 1 stud/ft with plates
      return Math.ceil(perimeter * studsPerFoot * (wallHeight / 8));
    },
    notes: '16" on-center; add 10% for waste',
    category: 'Framing',
  },
  {
    name: '2x6 Studs (exterior)',
    unit: 'pieces',
    formula: (sqft) => {
      const perimeter = Math.sqrt(sqft) * 4;
      return Math.ceil(perimeter * 0.75);
    },
    notes: 'Exterior walls only; 16" OC',
    category: 'Framing',
  },
  {
    name: 'Top/Bottom Plates (2x4)',
    unit: 'linear ft',
    formula: (sqft) => {
      const perimeter = Math.sqrt(sqft) * 4;
      return Math.ceil(perimeter * 3); // double top + single bottom
    },
    notes: 'Double top plate + single bottom plate',
    category: 'Framing',
  },
  {
    name: 'Plywood Sheathing (4x8)',
    unit: 'sheets',
    formula: (sqft, wallHeight) => {
      const perimeter = Math.sqrt(sqft) * 4;
      return Math.ceil((perimeter * wallHeight) / 32); // 32 sqft per sheet
    },
    notes: '7/16" OSB or 1/2" plywood',
    category: 'Framing',
  },
  // Drywall
  {
    name: 'Drywall Sheets (4x8)',
    unit: 'sheets',
    formula: (sqft, wallHeight) => {
      const perimeter = Math.sqrt(sqft) * 4;
      const wallArea = perimeter * wallHeight;
      const ceilingArea = sqft;
      return Math.ceil((wallArea + ceilingArea) / 32);
    },
    notes: '1/2" standard; 5/8" for fire-rated',
    category: 'Drywall',
  },
  {
    name: 'Joint Compound',
    unit: 'buckets (5gal)',
    formula: (sqft) => Math.ceil(sqft / 400),
    notes: 'Approx 1 bucket per 400 sqft',
    category: 'Drywall',
  },
  {
    name: 'Drywall Tape',
    unit: 'rolls (500ft)',
    formula: (sqft) => Math.ceil(sqft / 500),
    notes: 'Paper or mesh tape',
    category: 'Drywall',
  },
  // Roofing
  {
    name: 'Roofing Squares',
    unit: 'squares (100 sqft)',
    formula: (sqft) => {
      const roofArea = sqft * 1.15; // slope factor
      return Math.ceil(roofArea / 100);
    },
    notes: '1 square = 100 sqft; includes 15% slope factor',
    category: 'Roofing',
  },
  {
    name: 'Underlayment',
    unit: 'rolls',
    formula: (sqft) => {
      const roofArea = sqft * 1.15;
      return Math.ceil(roofArea / 400); // ~400 sqft per roll
    },
    notes: 'Synthetic underlayment; 4 sq/roll',
    category: 'Roofing',
  },
  {
    name: 'Drip Edge',
    unit: 'linear ft',
    formula: (sqft) => {
      return Math.ceil(Math.sqrt(sqft) * 4 * 1.1);
    },
    notes: 'Eave + rake edges; add 10% overlap',
    category: 'Roofing',
  },
  // Insulation
  {
    name: 'Batt Insulation (R-19)',
    unit: 'bags',
    formula: (sqft, wallHeight) => {
      const perimeter = Math.sqrt(sqft) * 4;
      const wallArea = perimeter * wallHeight;
      return Math.ceil(wallArea / 88); // ~88 sqft per bag
    },
    notes: '6.25" thick for 2x6 walls',
    category: 'Insulation',
  },
  {
    name: 'Ceiling Insulation (R-38)',
    unit: 'bags (blown)',
    formula: (sqft) => Math.ceil(sqft / 40),
    notes: 'Blown-in cellulose; ~40 sqft/bag at R-38',
    category: 'Insulation',
  },
  // Concrete
  {
    name: 'Concrete (foundation)',
    unit: 'cubic yards',
    formula: (sqft) => {
      return Math.ceil((sqft * 0.33) / 27); // 4" slab = 0.33 ft
    },
    notes: '4" slab; footings calculated separately',
    category: 'Foundation',
  },
  {
    name: 'Rebar (#4)',
    unit: 'linear ft',
    formula: (sqft) => {
      return Math.ceil(sqft * 2.5); // grid at 18" OC both ways
    },
    notes: '#4 rebar at 18" on-center grid',
    category: 'Foundation',
  },
];

export default function MaterialCalculator() {
  const [sqft, setSqft] = useState(500);
  const [wallHeight, setWallHeight] = useState(9);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [...new Set(MATERIALS.map(m => m.category))];

  const toggleCategory = (cat: string) => {
    setExpandedCategory(prev => prev === cat ? null : cat);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy dark:text-white">Material Calculator</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Rough material estimates based on square footage</p>
      </div>

      {/* Inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Ruler className="w-4 h-4 inline mr-1" />
              Square Footage
            </label>
            <input
              type="number"
              value={sqft}
              onChange={e => setSqft(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-lg font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Ruler className="w-4 h-4 inline mr-1" />
              Wall Height (feet)
            </label>
            <input
              type="number"
              value={wallHeight}
              onChange={e => setWallHeight(Math.max(1, parseInt(e.target.value) || 8))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-lg font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Material Categories */}
      <div className="space-y-3">
        {categories.map(cat => {
          const materials = MATERIALS.filter(m => m.category === cat);
          const isExpanded = expandedCategory === cat || expandedCategory === null;

          return (
            <div key={cat} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-navy dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{cat}</h3>
                  <span className="text-xs text-gray-400">{materials.length} items</span>
                </div>
                <span className={`text-sm text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <th className="text-left py-2 px-5 font-medium text-gray-600 dark:text-gray-400">Material</th>
                        <th className="text-right py-2 px-5 font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                        <th className="text-left py-2 px-5 font-medium text-gray-600 dark:text-gray-400">Unit</th>
                        <th className="text-left py-2 px-5 font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map(mat => (
                        <tr key={mat.name} className="border-t border-gray-100 dark:border-gray-700">
                          <td className="py-2.5 px-5 text-gray-900 dark:text-white">{mat.name}</td>
                          <td className="py-2.5 px-5 text-right font-bold text-navy dark:text-blue-400 text-lg">
                            {mat.formula(sqft, wallHeight).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-5 text-gray-500 dark:text-gray-400">{mat.unit}</td>
                          <td className="py-2.5 px-5 text-gray-400 text-xs hidden md:table-cell">{mat.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>These are rough estimates for planning purposes. Add 10–15% waste factor for materials. Actual quantities depend on design, openings (doors/windows), and layout. Always verify with your contractor.</p>
      </div>
    </div>
  );
}
