"use server";

import { calculatePayroll } from "@/lib/hr/payrollEngine";

// Using Mock for Phase 1.6 until we have full employee seeding
export async function getEmployeesAndPayroll() {
    const mockEmployees = [
        { id: "e1", name: "Kamal Perera", basic: 65000, allowances: 15000, role: "Technician" },
        { id: "e2", name: "Sunil Silva", basic: 45000, allowances: 5000, role: "Driver" },
        { id: "e3", name: "Nimali Fernando", basic: 120000, allowances: 25000, role: "Manager" }
    ];

    // Calculate real 2026 payroll for them
    return mockEmployees.map(emp => {
        const result = calculatePayroll({
            basicSalary: emp.basic,
            fixedAllowances: emp.allowances,
            otHours: 10 // Assume 10h OT for demo
        });
        return {
            ...emp,
            ...result
        };
    });
}
