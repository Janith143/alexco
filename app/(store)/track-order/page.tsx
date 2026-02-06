"use client";

import { useState } from "react";
import { trackTicket } from "@/server-actions/public/tracking";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function TrackOrderPage() {
    const [ticketNum, setTicketNum] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleTrack = async () => {
        if (!ticketNum || !phone) {
            setError("Please enter both Ticket Number and Phone Number");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await trackTicket(ticketNum, phone);
            if (res.success) {
                setResult(res);
            } else {
                setError(res.message || "Could not find ticket.");
            }
        } catch (e) {
            setError("An error occurred while tracking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Track Repair Status</h1>
                <p className="text-slate-500">
                    Enter your Job ID and Phone Number to check the real-time status of your device.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl border shadow-sm mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Job ID / Receipt No</label>
                        <Input
                            placeholder="e.g. JOB-2026-1001"
                            value={ticketNum}
                            onChange={(e) => setTicketNum(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                        <Input
                            placeholder="Registered Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
                <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={handleTrack}
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Track Status"}
                </Button>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden fade-in">
                    <div className="p-6 border-b bg-slate-50 flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{result.ticket.device_model}</h2>
                            <p className="text-sm text-slate-500">Customer: {result.ticket.customer_name}</p>
                        </div>
                        <div className="text-right">
                            <Badge className="mb-1 text-lg">{result.ticket.status}</Badge>
                            <div className="text-xs text-slate-500">ID: {result.ticket.ticket_number}</div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Repair Timeline
                        </h3>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {result.history.map((event: any, i: number) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    </div>

                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-lg border shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-slate-900">{event.action_type}</div>
                                            <time className="font-caveat font-medium text-indigo-500 text-xs">
                                                {new Date(event.created_at).toLocaleDateString()}
                                            </time>
                                        </div>
                                        <div className="text-slate-500 text-sm">
                                            {event.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {result.history.length === 0 && (
                                <p className="text-center text-slate-400">No activity recorded yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
