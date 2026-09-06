import { AdminLayout } from "@/components/layouts/admin-layout";
import { ActivityLogViewer } from "@/components/admin/activity-log-viewer";

export default function AdminActivitiesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-2 text-gray-600">View and filter system activity and user actions</p>
        </div>

        <ActivityLogViewer limit={100} />
      </div>
    </AdminLayout>
  );
}
