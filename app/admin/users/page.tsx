import { AdminLayout } from "@/components/layouts/admin-layout";
import { UserManagementTable } from "@/components/admin/user-management-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">Manage and monitor all users in the system</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <UserManagementTable />
      </div>
    </AdminLayout>
  );
}
