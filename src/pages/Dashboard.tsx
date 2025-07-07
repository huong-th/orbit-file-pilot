import {
  Folder,
  Image,
  Video,
  FileText,
  HardDrive,
  TrendingUp,
  Clock,
  Search,
  MoreHorizontal,
  Eye,
  Share2,
  Trash2,
  Move
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mock data with updated structure
const summaryData = {
  totalFolders: 24,
  totalImages: 1247,
  totalVideos: 89,
  totalDocuments: 456,
  storageUsed: 87.3,
  storageTotal: 100,
  newUploadsThisMonth: {
    images: 172,
    videos: 12,
    documents: 36,
    folders: 3
  }
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
  monthly: [
    { name: 'Jan', images: 287, videos: 45, documents: 189, others: 67 },
    { name: 'Feb', images: 356, videos: 52, documents: 234, others: 89 },
    { name: 'Mar', images: 423, videos: 61, documents: 298, others: 102 },
    { name: 'Apr', images: 298, videos: 38, documents: 187, others: 76 },
    { name: 'May', images: 387, videos: 67, documents: 256, others: 94 },
    { name: 'Jun', images: 445, videos: 73, documents: 312, others: 118 },
  ],
};

const fileTypeDistribution = [
  { name: 'Images', value: 1247, percentage: 62, color: '#3b82f6', size: '24.5 GB' },
  { name: 'Documents', value: 456, percentage: 23, color: '#10b981', size: '8.9 GB' },
  { name: 'Videos', value: 89, percentage: 4, color: '#f59e0b', size: '45.2 GB' },
  { name: 'Others', value: 234, percentage: 11, color: '#8b5cf6', size: '8.7 GB' },
];

const recentFiles = [
  {
    name: 'vacation-photo.jpg',
    type: 'Image',
    size: '2.4 MB',
    date: '2 hours ago',
    icon: '🖼️',
    fullDate: '2024-07-07 14:30'
  },
  {
    name: 'project-proposal.pdf',
    type: 'Document',
    size: '1.8 MB',
    date: '4 hours ago',
    icon: '📄',
    fullDate: '2024-07-07 12:30'
  },
  {
    name: 'presentation.mp4',
    type: 'Video',
    size: '45.2 MB',
    date: '1 day ago',
    icon: '🎥',
    fullDate: '2024-07-06 16:45'
  },
  {
    name: 'report-Q4.docx',
    type: 'Document',
    size: '892 KB',
    date: '2 days ago',
    icon: '📝',
    fullDate: '2024-07-05 10:20'
  },
  {
    name: 'screenshot.png',
    type: 'Image',
    size: '1.2 MB',
    date: '3 days ago',
    icon: '🖼️',
    fullDate: '2024-07-04 09:15'
  },
  {
    name: 'meeting-notes.txt',
    type: 'Document',
    size: '45 KB',
    date: '3 days ago',
    icon: '📝',
    fullDate: '2024-07-04 11:30'
  },
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Initialize time range from URL
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && ['daily', 'monthly'].includes(viewParam)) {
      setTimeRange(viewParam as 'daily' | 'monthly');
    }
  }, [searchParams]);

  const handleTimeRangeChange = (range: 'daily' | 'monthly') => {
    setTimeRange(range);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', range);
    setSearchParams(newSearchParams);
  };

  const getStorageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const storagePercentage = (summaryData.storageUsed / summaryData.storageTotal) * 100;

  const summaryCards = [
    {
      title: 'Folders',
      value: summaryData.totalFolders,
      newCount: summaryData.newUploadsThisMonth.folders,
      icon: Folder,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      emoji: '📁'
    },
    {
      title: 'Images',
      value: summaryData.totalImages,
      newCount: summaryData.newUploadsThisMonth.images,
      icon: Image,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      emoji: '🖼️'
    },
    {
      title: 'Videos',
      value: summaryData.totalVideos,
      newCount: summaryData.newUploadsThisMonth.videos,
      icon: Video,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      emoji: '🎬'
    },
    {
      title: 'Documents',
      value: summaryData.totalDocuments,
      newCount: summaryData.newUploadsThisMonth.documents,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      emoji: '📄'
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="glass-card p-3 border border-border/40 shadow-lg rounded-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">Total uploads: {total}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Filter recent files based on search and filters
  const filteredFiles = recentFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === 'all' || file.type.toLowerCase() === fileTypeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📂 Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Overview of your file storage and activity
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="🔍 Search files and folders"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryCards.map((card, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <span className="text-2xl">{card.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {card.value.toLocaleString()}
                      </p>
                      {card.newCount > 0 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          +{card.newCount} this month
                        </Badge>
                      )}
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
                💾 Storage Usage
              </CardTitle>
              <CardDescription>
                {summaryData.storageUsed} GB of {summaryData.storageTotal} GB used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="relative">
                  <Progress
                    value={storagePercentage}
                    className="h-4"
                  />
                  <div className={`absolute top-0 left-0 h-4 rounded-full transition-all ${getStorageColor(storagePercentage)}`}
                       style={{ width: `${storagePercentage}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {summaryData.storageUsed} GB used ({storagePercentage.toFixed(1)}%)
                  </span>
                  <span className="font-medium text-foreground">
                    Remaining: {(summaryData.storageTotal - summaryData.storageUsed).toFixed(1)} GB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Trends Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      📊 Upload Trends
                    </CardTitle>
                    <CardDescription>File uploads over time by type</CardDescription>
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
                      variant={timeRange === 'monthly' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={uploadTrendsData[timeRange]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
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
                <CardTitle>📂 File Type Distribution (All Time)</CardTitle>
                <CardDescription>Breakdown by file count and storage size</CardDescription>
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
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fileTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: string, props: any) => [
                          `${value} files (${props.payload.size})`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {fileTypeDistribution.map((type, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-muted-foreground">
                        {type.name}: {type.value} files ({type.size})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Files Table */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    🕓 Recent Files
                  </CardTitle>
                  <CardDescription>Latest uploaded files</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="File type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This week</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.slice(0, 5).map((file, index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center gap-3">
                        <span className="text-lg">{file.icon}</span>
                        <span className="font-medium">{file.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{file.date}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{file.fullDate}</p>
                          </TooltipContent>
                        </UITooltip>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="mr-2 h-4 w-4" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-center">
                <Button variant="outline">
                  View All Files ({recentFiles.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">This Week Highlights</p>
                  <p className="font-medium">
                    You uploaded <span className="text-primary font-bold">532 files</span> – mostly images
                  </p>
                  <p className="font-medium">
                    Storage increased by <span className="text-green-600 font-bold">4.3 GB (+6%)</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick Stats</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {summaryData.newUploadsThisMonth.images + summaryData.newUploadsThisMonth.documents + summaryData.newUploadsThisMonth.videos} new files this month
                    </Badge>
                    <Badge variant="outline">
                      {fileTypeDistribution.reduce((sum, type) => sum + type.value, 0)} total files
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Dashboard;
