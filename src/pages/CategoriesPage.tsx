import { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Trash2 } from 'lucide-react';

export const CategoriesPage = () => {
    const { data, addCategory, updateCategory, deleteCategory } = useData();
    const categories = data.categories;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null); // Type 'any' for now or import Category
    const [catName, setCatName] = useState('');

    const openAdd = () => {
        setEditingCategory(null);
        setCatName('');
        setIsModalOpen(true);
    };

    const openEdit = (cat: any) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!catName.trim()) return;

        if (editingCategory) {
            await updateCategory({
                ...editingCategory,
                name: catName
            });
        } else {
            await addCategory({
                name: catName,
                isFixed: false,
                icon: 'tag',
                color: '#ffffff'
            });
        }

        setIsModalOpen(false);
        setCatName('');
        setEditingCategory(null);
    };

    return (
        <div className="space-y-6 pb-20 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
                    <p className="text-muted-foreground">Personaliza tus gastos.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    + Nueva
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                    <Card
                        key={cat.id}
                        onClick={() => openEdit(cat)}
                        className="p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/5 text-center group relative cursor-pointer active:scale-95 transition-all"
                    >
                        {/* Delete Button (Hover) */}
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm(`¿Eliminar categoría "${cat.name}"?`)) {
                                    await deleteCategory(cat.id);
                                }
                            }}
                            className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="text-3xl mb-2">{/* Icon placeholder */} 🏷️</div>
                        <h3 className="font-semibold text-sm">{cat.name}</h3>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Nombre</label>
                        <input
                            value={catName}
                            onChange={e => setCatName(e.target.value)}
                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                            placeholder="Ej. Streaming, Mascotas..."
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
                    </button>
                </div>
            </Modal>
        </div>
    );
};
