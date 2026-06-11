"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Users, Search, Check, X, Loader2 } from "lucide-react"
import {
  useGetUsersQuery, useUpdateSellerStatusMutation, useResetUserPasswordMutation,
} from "@/store/api/userApi"
import { useToast } from "@/hooks/use-toast"
import { EmptyHint, initials } from "@/components/admin/admin-ui"

export default function AdminUsersPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const { data, isLoading } = useGetUsersQuery(undefined, { skip: !isAdmin })
  const [updateSellerStatus, { isLoading: isUpdating }] = useUpdateSellerStatusMutation()
  const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation()

  const users = useMemo(() => data?.data ?? [], [data])
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleResetPassword = async (userId: string, userName: string) => {
    const pwd = window.prompt(`Set a new password for ${userName} (min 6 chars):`)
    if (pwd === null) return
    if (pwd.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" })
      return
    }
    setProcessingId(userId)
    try {
      await resetPassword({ id: userId, password: pwd }).unwrap()
      toast({ title: "Password reset", description: `${userName} can now sign in with the new password.` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  const handleSellerStatus = async (userId: string, status: "approved" | "rejected") => {
    setProcessingId(userId)
    try {
      await updateSellerStatus({ id: userId, status }).unwrap()
      toast({ title: `Seller ${status}` })
    } catch {
      toast({ title: "Action failed", variant: "destructive" })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Everyone on the platform — buyers, sellers, and admins.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{filtered.length} user{filtered.length !== 1 ? "s" : ""}</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyHint icon={Users} text="No users match your search." />
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 border rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    {user.is_admin && <Badge variant="destructive" className="text-xs">Admin</Badge>}
                    {user.is_seller && (
                      <Badge
                        variant={user.seller_status === "approved" ? "default" : user.seller_status === "pending" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {user.seller_status}
                      </Badge>
                    )}
                    <Button
                      size="sm" variant="outline" className="gap-1 text-xs h-7 bg-transparent"
                      onClick={() => handleResetPassword(user.id, user.name)}
                      disabled={processingId === user.id || isResetting}
                    >
                      {processingId === user.id && isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Reset password
                    </Button>
                    {user.is_seller && user.seller_status === "pending" && (
                      <>
                        <Button
                          size="sm" className="gap-1 bg-green-600 hover:bg-green-700 text-xs h-7"
                          onClick={() => handleSellerStatus(user.id, "approved")}
                          disabled={processingId === user.id || isUpdating}
                        >
                          {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm" variant="destructive" className="gap-1 text-xs h-7"
                          onClick={() => handleSellerStatus(user.id, "rejected")}
                          disabled={processingId === user.id || isUpdating}
                        >
                          <X className="w-3 h-3" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
