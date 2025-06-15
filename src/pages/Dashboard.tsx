
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Folder, 
  Image, 
  Video, 
  FileText, 
  HardDrive, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

// Mock data
const summaryData = {
  totalFolders: 24,
  totalImages: 1247,
  totalVideos: 89,
  totalDocuments: 456,
  storageUsed: 87.3, // GB
  storageTotal: 100, // GB
};

const uploadTrendsData = {
  daily: [
    { name: 'Mon', images: 12, videos: 2, documents: 8, others: 3 },
    { name: 'Tue', images: 19, videos: 4, documents: 12, others: 5 },
    { name: 'Wed', images: 8, videos: 1, documents: 15, others: 2 },
    { name: 'Thu', images: 25, videos: 6, documents: 9, others: 7 },
    { name: 'Fri', images: 18, videos: 3, documents: 18, others: 4 },
    { name: 'Sat', images: 31, videos: 8, documents: 6, others: 9 },
    { name: 'Sun', images: 22, videos: 5, documents: 11, others: 6 },
  ],
  weekly: [
    { name: 'Week 1', images: 89, videos: 15, documents: 67, others: 23 },
    { name: 'Week 2', images: 127, videos: 22, documents: 89, others: 34 },
    { name: 'Week 3', images: 156, videos: 18, documents: 112, others: 28 },
    { name: 'Week 4', images: 134, videos: 29, documents: 98, others: 41 },
  ],
  monthly: [
    { name: 'Jan', images: 287, videos: 45, documents: 189, others: 67 },
    { name: 'Feb', images: 356, videos: 52, documents: 234, others: 89 },
    { name: 'Mar', images: 423, videos: 61, documents: 298, others: 102 },
    { name: 'Apr', images: 298, videos: 38, documents: 187, others: 76 },
    { name: 'May', images: 387, videos: 67, documents: 256, others: 94 },
    { name: 'Jun', images: 445, videos: 73, documents: 312, others: 118 },
  ]
};

const fileTypeDistribution = [
  { name: 'Images', value: 1247, color: '#3b82f6' },
  { name: 'Documents', value: 456, color: '#10b981' },
  { name: 'Videos', value: 89, color: '#f59e0b' },
  { name: 'Others', value: 234, color: '#8b5cf6' },
];

const recentFiles = [
  { name: 'vacation-photo.jpg', type: 'Image', size: '2.4 MB', date: '2 hours ago', icon: '🖼️' },
  { name: 'project-proposal.pdf', type: 'Document', size: '1.8 MB', date: '4 hours ago', icon: '📄' },
  { name: 'presentation.mp4', type: 'Video', size: '45.2 MB', date: '1 day ago', icon: '🎥' },
  { name: 'report-Q4.docx', type: 'Document', size: '892 KB', date: '2 days ago', icon: '📝' },
  { name: 'screenshot.png', type: 'Image', size: '1.2 MB', date: '3 days ago', icon: '🖼️' },
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Initialize time range from URL
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && ['daily', 'weekly', 'monthly'].includes(viewParam)) {
      setTimeRange(viewParam as 'daily' | 'weekly' | 'monthly');
    }
  }, [searchParams]);

  const handleTimeRangeChange = (range: 'daily' | 'weekly' | 'monthly') => {
    setTimeRange(range);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', range);
    setSearchParams(newSearchParams);
  };

  const summaryCards = [
    {
      title: 'Total Folders',
      value: summaryData.totalFolders,
      icon: Folder,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Images',
      value: summaryData.totalImages,
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Videos',
      value: summaryData.totalVideos,
      icon: Video,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Documents',
      value: summaryData.totalDocuments,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your file storage and activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={timeRange === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('daily')}
            >
              Daily
            </Button>
            <Button
              variant={timeRange === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={timeRange === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('monthly')}
            >
              Monthly
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Storage Usage Card */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>
              {summaryData.storageUsed} GB of {summaryData.storageTotal} GB used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress 
                value={(summaryData.storageUsed / summaryData.storageTotal) * 100} 
                className="h-3"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{summaryData.storageUsed} GB used</span>
                <span>{summaryData.storageTotal - summaryData.storageUsed} GB available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Trends Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Upload Trends
              </CardTitle>
              <CardDescription>File uploads over time by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uploadTrendsData[timeRange]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="images" stackId="a" fill="#3b82f6" name="Images" />
                    <Bar dataKey="documents" stackId="a" fill="#10b981" name="Documents" />
                    <Bar dataKey="videos" stackId="a" fill="#f59e0b" name="Videos" />
                    <Bar dataKey="others" stackId="a" fill="#8b5cf6" name="Others" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* File Type Distribution */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>File Type Distribution</CardTitle>
              <CardDescription>Breakdown by file count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fileTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {fileTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Files Table */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Files
            </CardTitle>
            <CardDescription>Latest uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFiles.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-3">
                      <span className="text-lg">{file.icon}</span>
                      <span className="font-medium">{file.name}</span>
                    </TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{file.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
