import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, User } from "lucide-react";

interface EmployeeAccessTabProps {
    userAccount: any;
    employee: any;
    handleCreateUser: (e: React.FormEvent) => void;
}

export function EmployeeAccessTab({ userAccount, employee, handleCreateUser }: EmployeeAccessTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> System Access</CardTitle>
            </CardHeader>
            <CardContent>
                {userAccount ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-4">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-900">Active User Account</h3>
                                <p className="text-sm text-green-700">Username: <strong>{userAccount.username}</strong></p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-xs text-slate-500">Role</p>
                                <p className="font-medium capitalize">{userAccount.role.replace('_', ' ')}</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-xs text-slate-500">Last Login</p>
                                <p className="font-medium">{userAccount.last_login ? new Date(userAccount.last_login).toLocaleString() : 'Never'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" disabled>Reset Password (Contact Admin)</Button>
                            <Button variant="destructive" disabled>Deactivate Account</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 border rounded-lg">
                            <p className="text-slate-600 mb-4">No system user account linked to this employee.</p>
                            <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Username</label>
                                    <input name="username" required className="w-full px-3 py-2 border rounded-md" defaultValue={employee.employee_number} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <input type="password" name="password" required className="w-full px-3 py-2 border rounded-md" minLength={6} placeholder="Min 6 characters" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <select name="role" required className="w-full px-3 py-2 border rounded-md">
                                        <option value="user">Standard User</option>
                                        <option value="hr_manager">HR Manager</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <Button type="submit">Create User Account</Button>
                            </form>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
