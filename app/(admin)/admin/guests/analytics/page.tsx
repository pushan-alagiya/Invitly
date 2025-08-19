"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function AdminGuestAnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Guest Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Detailed insights into guest behavior and trends
            </p>
          </div>
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Guests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Confirmation Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.3%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 days</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                +0.3 days from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No-Show Rate
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.7%</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -2.1% from last month
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guest Demographics */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Guest Locations
              </CardTitle>
              <CardDescription>Most common guest locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                  <div className="text-sm font-medium">23%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">New York, NY</span>
                  </div>
                  <div className="text-sm font-medium">18%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Austin, TX</span>
                  </div>
                  <div className="text-sm font-medium">15%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Chicago, IL</span>
                  </div>
                  <div className="text-sm font-medium">12%</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Seattle, WA</span>
                  </div>
                  <div className="text-sm font-medium">10%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Guest Activity by Month
              </CardTitle>
              <CardDescription>Guest registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">January</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">650</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">February</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">780</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">March</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">920</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">April</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">850</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Performance */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Event Performance by Guest Count
            </CardTitle>
            <CardDescription>
              Top performing events based on guest engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Annual Tech Conference 2024</div>
                  <div className="text-sm text-muted-foreground">
                    Tech Conference 2024
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">500 guests</div>
                  <div className="text-sm text-green-600">
                    94% confirmation rate
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Product Launch Party</div>
                  <div className="text-sm text-muted-foreground">
                    Mobile Apps Inc
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">200 guests</div>
                  <div className="text-sm text-green-600">
                    90% confirmation rate
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Marketing Summit</div>
                  <div className="text-sm text-muted-foreground">
                    Marketing Pro
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">300 guests</div>
                  <div className="text-sm text-green-600">
                    93% confirmation rate
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Team Building Workshop</div>
                  <div className="text-sm text-muted-foreground">
                    HR Solutions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">75 guests</div>
                  <div className="text-sm text-yellow-600">
                    60% confirmation rate
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Startup Networking Event</div>
                  <div className="text-sm text-muted-foreground">
                    Startup Hub
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">150 guests</div>
                  <div className="text-sm text-green-600">
                    85% confirmation rate
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guest Behavior Insights */}
      <div className="px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>
                How quickly guests respond to invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Same day</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1-2 days</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "42%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">3-7 days</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: "18%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1+ weeks</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: "5%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guest Status Distribution</CardTitle>
              <CardDescription>
                Current status of all invited guests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Confirmed</span>
                  </div>
                  <div className="text-sm font-medium">2,230 (78.3%)</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="text-sm font-medium">435 (15.3%)</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Declined</span>
                  </div>
                  <div className="text-sm font-medium">182 (6.4%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
