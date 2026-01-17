import { Product } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface ProductTableRowProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onToggleStock: (id: string, inStock: boolean) => void;
}

export const ProductTableRow = ({
    product,
    onEdit,
    onDelete,
    onToggleStock,
}: ProductTableRowProps) => {
    return (
        <tr className="border-b border-border hover:bg-muted/50 transition-colors">
            <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.unit}</p>
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {product.category}
                </span>
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">₹{product.price}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                        </span>
                    )}
                </div>
            </td>
            <td className="py-3 px-4">
                <button
                    onClick={() => onToggleStock(product.id, !product.inStock)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${product.inStock
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                </button>
            </td>
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="hover:bg-primary/10"
                    >
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product.id)}
                        className="hover:bg-destructive/10 text-destructive"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};
