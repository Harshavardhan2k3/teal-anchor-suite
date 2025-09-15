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

  const fetchPayrollRecords = async () => {
    try {
      // Mock payroll data since we don't have a payroll table yet
      const mockData: PayrollRecord[] = [
        {
          id: '1',
          emp_id: 'EMP001',
          fixed_pay: 5000,
          special_pay: 500,
          total_pay: 5500,
          pay_period: '2024-01-01',
          user_profiles: { full_name: 'John Doe' }
        },
        {
          id: '2',
          emp_id: 'EMP002',
          fixed_pay: 4500,
          special_pay: 300,
          total_pay: 4800,
          pay_period: '2024-01-01',
          user_profiles: { full_name: 'Jane Smith' }
        },
        {
          id: '3',
          emp_id: 'EMP003',
          fixed_pay: 6000,
          special_pay: 800,
          total_pay: 6800,
          pay_period: '2024-01-01',
          user_profiles: { full_name: 'Mike Johnson' }
        }
      ];

      setPayrollRecords(mockData);
      const total = mockData.reduce((sum, record) => sum + record.total_pay, 0);
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
                    <TableHead className="text-card-foreground">Fixed Pay</TableHead>
                    <TableHead className="text-card-foreground">Special Pay</TableHead>
                    <TableHead className="text-card-foreground">Total Pay</TableHead>
                    <TableHead className="text-card-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No payroll records found for this period
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((record) => (
                      <TableRow key={record.id} className="border-border">
                        <TableCell className="text-card-foreground">{record.emp_id}</TableCell>
                        <TableCell className="text-card-foreground">{record.user_profiles?.full_name || 'Unknown'}</TableCell>
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