"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2, Tag } from "lucide-react"
import Link from "next/link"
import {
  useGetMyStoreQuery,
  useCreateStoreCategoryMutation,
  useUpdateStoreCategoryMutation,
  useDeleteStoreCategoryMutation,
  useGetStoreCategoriesQuery,
} from "@/store/api/storeApi"
import { useToast } from "@/hooks/use-toast"

export default function StoreCategoriesPage() {
  const { toast } = useToast()
  const { data: myStore, isLoading: storeLoading } = useGetMyStoreQuery()
  const storeId = myStore?.id ?? ""

  const { data: catData, isLoading: catsLoading } = useGetStoreCategoriesQuery(storeId, { skip: !storeId })
  const categories = catData ?? []

  const [createCategory, { isLoading: isCreating }] = useCreateStoreCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateStoreCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteStoreCategoryMutation()

  const [newName, setNewName]       = useState("")
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editName, setEditName]     = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      await createCategory({ name: newName.trim() }).unwrap()
      setNewName("")
      toast({ title: "Category created", description: `"${newName}" added to your store.` })
    } catch {
      toast({ title: "Create failed", variant: "destructive" })
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateCategory({ id, name: editName.trim() }).unwrap()
      setEditingId(null)
      toast({ title: "Category updated" })
    } catch {
      toast({ title: "Update failed", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category won't be deleted.`)) return
    setDeletingId(id)
    try {
      await deleteCategory(id).unwrap()
      toast({ title: "Category deleted" })
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const isLoading = storeLoading || catsLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/seller/store-builder">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Store Categories
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Add new category */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
            <CardDescription>Organize your products into categories for easier browsing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Category name (e.g., Summer Collection, New Arrivals)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={!newName.trim() || isCreating} className="gap-2 flex-shrink-0">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories list */}
        <Card>
          <CardHeader>
            <CardTitle>Your Categories</CardTitle>
            <CardDescription>{isLoading ? "Loading..." : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No categories yet. Add one above to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const isEditingThis = editingId === cat.id
                  const isDeletingThis = deletingId === cat.id
                  return (
                    <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                      {isEditingThis ? (
                        <>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(cat.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                          />
                          <Button size="icon" onClick={() => handleUpdate(cat.id)} disabled={isUpdating} className="flex-shrink-0">
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="flex-shrink-0">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">#{cat.sort_order + 1}</Badge>
                          <Button size="icon" variant="ghost" onClick={() => startEdit(cat.id, cat.name)} className="flex-shrink-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            disabled={isDeletingThis || isDeleting}
                          >
                            {isDeletingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
