import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'generated' | 'processing' | 'failed';
  downloadUrl?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    // Mock reports data
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Attendance Report - January 2024',
        type: 'attendance',
        date: '2024-01-31',
        status: 'generated',
        downloadUrl: '#'
      },
      {
        id: '2',
        name: 'Payroll Summary - December 2023',
        type: 'payroll',
        date: '2023-12-31',
        status: 'generated',
        downloadUrl: '#'
      },
      {
        id: '3',
        name: 'Employee Performance Report - Q4 2023',
        type: 'performance',
        date: '2023-12-31',
        status: 'generated',
        downloadUrl: '#'
      }
    ];
    
    setReports(mockReports);
  };

  const handleGenerateReport = async () => {
    if (!reportType || !dateRange.startDate || !dateRange.endDate) {
      toast({
        title: "Error",
        description: "Please select report type and date range",
        variant: "destructive"
      });
      return;
    }

    // Mock report generation
    const newReport: Report = {
      id: Date.now().toString(),
      name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${dateRange.startDate} to ${dateRange.endDate}`,
      type: reportType,
      date: new Date().toISOString().split('T')[0],
      status: 'generated',
      downloadUrl: '#'
    };

    setReports(prev => [newReport, ...prev]);
    
    toast({
      title: "Success",
      description: "Report generated successfully"
    });

    // Reset form
    setReportType('');
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleDownload = (report: Report) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.name}`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'text-primary';
      case 'processing': return 'text-yellow-500';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return '✓';
      case 'processing': return '⏳';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and download various reports</p>
      </div>

      {/* Report Generation */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType" className="text-card-foreground">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="payroll">Payroll Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="leave">Leave Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-card-foreground">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-card-foreground">End Date</Label>
              <Input
                type="date"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleGenerateReport} className="bg-primary hover:bg-primary/90">
              Generate Report
            </Button>
            <Button variant="outline" className="border-border">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-card-foreground">Report Name</TableHead>
                <TableHead className="text-card-foreground">Type</TableHead>
                <TableHead className="text-card-foreground">Generated Date</TableHead>
                <TableHead className="text-card-foreground">Status</TableHead>
                <TableHead className="text-card-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No reports generated yet
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id} className="border-border">
                    <TableCell className="text-card-foreground">{report.name}</TableCell>
                    <TableCell className="text-card-foreground capitalize">{report.type}</TableCell>
                    <TableCell className="text-card-foreground">
                      {new Date(report.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={`font-medium ${getStatusColor(report.status)}`}>
                      <span className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {report.status === 'generated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
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