import POSInterface from "@/components/pos/POSInterface";

export const metadata = {
    title: "Alexco POS | Checkouts",
    description: "Offline-First Point of Sale",
};

export default function POSPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <POSInterface />
        </main>
    );
}
