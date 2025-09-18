import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PayrollRecord {
  id: string;
  emp_id: string;
  fixed_pay: number;
  special_pay: number;
  total_pay: number;
  pay_period: string;
  total_hours: number;
  user_profiles?: {
    full_name: string;
  };
}

export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [totalPayroll, setTotalPayroll] = useState(0);

  useEffect(() => {
    fetchPayrollRecords();
  }, [activeTab]);

  const getDateRange = () => {
    const now = new Date();
    let startDate: string;
    let endDate: string;

    switch (activeTab) {
      case 'today':
        startDate = now.toISOString().split('T')[0];
        endDate = startDate;
        break;
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        startDate = now.toISOString().split('T')[0];
        endDate = startDate;
    }

    return { startDate, endDate };
  };

  const calculateTotalHours = (loginTime: string, logoutTime: string) => {
    if (!loginTime || !logoutTime) return 0;
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    
    return Math.max(0, Math.round(hours * 100) / 100); // Round to 2 decimal places
  };

  const fetchPayrollRecords = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      
      // Fetch all employees
      const { data: employees, error: empError } = await supabase
        .from('user_profiles')
        .select('emp_id, full_name');

      if (empError) throw empError;

      // Fetch attendance records for the date range
      const { data: attendanceRecords, error: attError } = await supabase
        .from('attendance_records')
        .select('emp_id, login_time, logout_time, created_at')
        .gte('created_at', startDate + 'T00:00:00.000Z')
        .lte('created_at', endDate + 'T23:59:59.999Z');

      if (attError) throw attError;

      // Calculate total hours for each employee
      const payrollData: PayrollRecord[] = employees?.map(employee => {
        const empAttendance = attendanceRecords?.filter(record => record.emp_id === employee.emp_id) || [];
        
        const totalHours = empAttendance.reduce((sum, record) => {
          return sum + calculateTotalHours(record.login_time, record.logout_time);
        }, 0);

        // Mock salary calculation (you can adjust this based on your business logic)
        const hourlyRate = 25; // $25 per hour (this could come from a salary table)
        const fixed_pay = Math.round(totalHours * hourlyRate);
        const special_pay = Math.round(fixed_pay * 0.1); // 10% bonus
        const total_pay = fixed_pay + special_pay;

        return {
          id: employee.emp_id,
          emp_id: employee.emp_id,
          fixed_pay,
          special_pay,
          total_pay,
          pay_period: startDate,
          total_hours: Math.round(totalHours * 100) / 100,
          user_profiles: { full_name: employee.full_name }
        };
      }) || [];

      setPayrollRecords(payrollData);
      const total = payrollData.reduce((sum, record) => sum + record.total_pay, 0);
      setTotalPayroll(total);
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payroll records",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Mock delete functionality
      const updatedRecords = payrollRecords.filter(record => record.id !== id);
      setPayrollRecords(updatedRecords);
      const total = updatedRecords.reduce((sum, record) => sum + record.total_pay, 0);
      setTotalPayroll(total);

      toast({
        title: "Success",
        description: "Payroll record deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting payroll record:', error);
      toast({
        title: "Error",
        description: "Failed to delete payroll record",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case 'today': return "Today's Payroll";
      case 'weekly': return "Weekly Payroll";
      case 'monthly': return "Monthly Payroll";
      default: return "Payroll";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payroll</h1>
        <p className="text-muted-foreground">Manage employee salaries and payments</p>
      </div>

      {/* Summary Panel */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payroll Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatCurrency(totalPayroll)}
          </div>
          <p className="text-muted-foreground">{getTabLabel()} Total</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
          <TabsTrigger value="today" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Today
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">{getTabLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-card-foreground">Employee ID</TableHead>
                    <TableHead className="text-card-foreground">Name</TableHead>
                    <TableHead className="text-card-foreground">Total Hours</TableHead>
                    <TableHead className="text-card-foreground">Fixed Pay</TableHead>
                    <TableHead className="text-card-foreground">Special Pay</TableHead>
                    <TableHead className="text-card-foreground">Total Pay</TableHead>
                    <TableHead className="text-card-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No payroll records found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((record) => (
                      <TableRow key={record.id} className="border-border">
                        <TableCell className="text-card-foreground">{record.emp_id}</TableCell>
                        <TableCell className="text-card-foreground">{record.user_profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="text-card-foreground">
                          <span className="font-semibold text-primary">{record.total_hours}h</span>
                        </TableCell>
                        <TableCell className="text-card-foreground">{formatCurrency(record.fixed_pay)}</TableCell>
                        <TableCell className="text-card-foreground">{formatCurrency(record.special_pay)}</TableCell>
                        <TableCell className="text-card-foreground font-semibold">{formatCurrency(record.total_pay)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-primary hover:bg-primary/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}