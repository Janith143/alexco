"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeesAndPayroll } from "@/server-actions/admin/hr";
import { Download } from "lucide-react";

export default function PayrollPage() {
    const [payroll, setPayroll] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getEmployeesAndPayroll();
            setPayroll(data);
            setLoading(false);
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Payroll Processing (Jan 2026)</h1>
                <Button className="gap-2" variant="outline">
                    <Download className="h-4 w-4" /> Export Bank File
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Calculated Salaries (Preview)</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading payroll engine...</div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3">Employee</th>
                                        <th className="px-4 py-3">Basic + Allow</th>
                                        <th className="px-4 py-3">EPF (8%)</th>
                                        <th className="px-4 py-3">Tax (APIT)</th>
                                        <th className="px-4 py-3 text-right">Net Salary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payroll.map((p) => (
                                        <tr key={p.id} className="border-b">
                                            <td className="px-4 py-3 font-medium">
                                                {p.name}
                                                <div className="text-xs text-slate-400">{p.role}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {(p.grossSalary || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-red-500">
                                                -{(p.epfEmployee || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-red-500">
                                                -{(p.apitTax || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                {(p.netSalary || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
