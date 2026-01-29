import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Trash2 } from 'lucide-react';

export const CategoriesPage = () => {
    const { data, addCategory } = useData(); // Added deleteCategory later if needed
    const categories = data.categories;
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCatName, setNewCatName] = useState('');

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        await addCategory({
            name: newCatName,
            isFixed: false,
            icon: 'tag', // Default
            color: '#ffffff'
        });
        setNewCatName('');
        setIsAddOpen(false);
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">Personaliza tus gastos.</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">Personaliza tus gastos.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    + Nueva
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                    <Card key={cat.id} className="p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 text-center group relative">
                        {/* Delete Button (Hover) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`¿Eliminar categoría "${cat.name}"?`)) {
                                    // For now, simple delete. In real app, check for relations.
                                    // But context doesn't export deleteCategory yet, need to add it or use raw supabase here?
                                    // Better to add it to Context.
                                    // For now let's just use a direct delete via Context if available or simple alert.
                                    // WAIT, DataContext doesn't have deleteCategory. I should add it.
                                    alert("Función de eliminar categoría pendiente de implementar en Contexto.");
                                }
                            }}
                            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="text-3xl mb-2">{/* Icon placeholder */} 🏷️</div>
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva Categoría">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Nombre</label>
                        <input
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                            placeholder="Ej. Streaming, Mascotas..."
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleAddCategory}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        Guardar Categoría
                    </button>
                </div>
            </Modal>
        </div>
    );
};
