import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';

export const CategoriesPage = () => {
    const { data } = useData();
    const categories = data.categories;

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">Personaliza tus gastos.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                    <Card key={cat.id} className="p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 text-center">
                        <div className="text-3xl mb-2">{/* Icon placeholder */} 🏷️</div>
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                    </Card>
                ))}
            </div>
        </div>
    );
};
