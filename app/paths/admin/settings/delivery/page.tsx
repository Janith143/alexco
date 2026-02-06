import DeliveryRateManager from "@/components/admin/settings/DeliveryRateManager";

export default function DeliverySettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Settings</h1>
                <p className="text-slate-500">Configure delivery rates based on weight ranges.</p>
            </div>

            <DeliveryRateManager />
        </div>
    );
}
