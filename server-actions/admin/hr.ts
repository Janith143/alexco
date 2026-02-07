"use server";

import { calculatePayroll } from "@/lib/hr/payrollEngine";
import { query } from "@/lib/db";

export async function getEmployeesAndPayroll() {
    try {
        // Fetch real employees from database
        const employees = await query(`
            SELECT id, full_name as name, basic_salary as basic, fixed_allowances as allowances, role
            FROM employees
            WHERE is_active = TRUE
            ORDER BY full_name
        `) as any[];

        if (employees.length === 0) {
            return [];
        }

        // Calculate payroll for each employee
        return employees.map(emp => {
            const result = calculatePayroll({
                basicSalary: Number(emp.basic) || 0,
                fixedAllowances: Number(emp.allowances) || 0,
                otHours: 0 // OT hours should come from attendance_logs
            });
            return {
                id: emp.id,
                name: emp.name,
                basic: Number(emp.basic) || 0,
                allowances: Number(emp.allowances) || 0,
                role: emp.role,
                ...result
            };
        });
    } catch (error) {
        console.error("Get Employees And Payroll Error:", error);
        return [];
    }
}
