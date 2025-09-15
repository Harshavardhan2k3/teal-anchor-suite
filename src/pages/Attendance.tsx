import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Download, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  emp_id: string;
  login_time: string;
  logout_time: string | null;
  status: 'present' | 'late' | 'absent';
  user_profiles?: {
    full_name: string;
  };
}

export default function Attendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          user_profiles!inner(full_name)
        `)
        .gte('created_at', `${selectedDate}T00:00:00`)
        .lt('created_at', `${selectedDate}T23:59:59`)
        .order('login_time', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive"
      });
    }
  };

  const calculateWorkHours = (loginTime: string, logoutTime: string | null) => {
    if (!logoutTime) return "In Progress";
    
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    const diffMs = logout.getTime() - login.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const exportToCSV = () => {
    const headers = ['Employee ID', 'Name', 'Login Time', 'Logout Time', 'Total Hours', 'Status'];
    const rows = attendanceRecords.map(record => [
      record.emp_id,
      record.user_profiles?.full_name || 'Unknown',
      new Date(record.login_time).toLocaleTimeString(),
      record.logout_time ? new Date(record.logout_time).toLocaleTimeString() : 'Not logged out',
      calculateWorkHours(record.login_time, record.logout_time),
      record.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Attendance data exported successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-primary';
      case 'late': return 'text-yellow-500';
      case 'absent': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Track employee attendance and working hours</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto bg-background border-border text-foreground"
          />
        </div>
        
        <Button onClick={exportToCSV} variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-card-foreground">Employee ID</TableHead>
                <TableHead className="text-card-foreground">Name</TableHead>
                <TableHead className="text-card-foreground">Login Time</TableHead>
                <TableHead className="text-card-foreground">Logout Time</TableHead>
                <TableHead className="text-card-foreground">Total Hours</TableHead>
                <TableHead className="text-card-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No attendance records found for this date
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords.map((record) => (
                  <TableRow key={record.id} className="border-border">
                    <TableCell className="text-card-foreground">{record.emp_id}</TableCell>
                    <TableCell className="text-card-foreground">{record.user_profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell className="text-card-foreground">
                      {new Date(record.login_time).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {record.logout_time ? new Date(record.logout_time).toLocaleTimeString() : 'Not logged out'}
                    </TableCell>
                    <TableCell className="text-card-foreground">
                      {calculateWorkHours(record.login_time, record.logout_time)}
                    </TableCell>
                    <TableCell className={`capitalize font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}