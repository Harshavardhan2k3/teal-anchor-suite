import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function QRGenerator() {
  const [qrData, setQrData] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => {
          if (countdown <= 1) {
            generateNewQR();
            return 20; // Reset to 20 seconds
          }
          return countdown - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, countdown]);

  const generateQRCode = (data: string) => {
    // Simple QR code generation using a placeholder
    // In a real app, you would use a proper QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
  };

  const generateNewQR = async () => {
    try {
      // Generate a unique session ID
      const sessionId = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock Supabase call to store QR session
      // In real implementation, this would create a record in the 'qrs' table
      
      setQrData(sessionId);
      
      toast({
        title: "QR Code Generated",
        description: "New QR session created successfully"
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const handleGenerateQR = () => {
    generateNewQR();
    setCountdown(20);
    setIsActive(true);
  };

  const handleStopSession = () => {
    setIsActive(false);
    setCountdown(0);
    setQrData('');
    
    toast({
      title: "Session Stopped",
      description: "QR code session has been terminated"
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate QR codes for attendance tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code Session
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {qrData ? (
              <>
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <img
                    src={generateQRCode(qrData)}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Session ID</p>
                  <code className="px-3 py-1 bg-muted rounded text-sm font-mono text-card-foreground">
                    {qrData}
                  </code>
                </div>
                
                {isActive && (
                  <div className="flex items-center gap-2 text-primary">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono text-lg font-semibold">
                      {formatTime(countdown)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Active Session</h3>
                <p className="text-muted-foreground mb-4">Generate a QR code to start attendance tracking</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Session Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-card-foreground mb-2">How it works</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Generate a QR code for employee check-in</li>
                  <li>• Code expires automatically after 20 seconds</li>
                  <li>• New code is generated automatically when expired</li>
                  <li>• Employees scan to record attendance</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                {!isActive ? (
                  <Button 
                    onClick={handleGenerateQR} 
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    Generate QR Code
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={generateNewQR} 
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10"
                      size="lg"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Refresh Now
                    </Button>
                    <Button 
                      onClick={handleStopSession} 
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      Stop Session
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isActive && (
              <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="font-semibold">Session Active</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  QR code will refresh automatically in {countdown} seconds
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${(countdown / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No Recent Sessions</h3>
            <p className="text-muted-foreground">Session history will appear here once you start generating QR codes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}