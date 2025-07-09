"use client";

import { BaseClient } from "@/api/ApiClient";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { projectEndPoint } from "@/utils/apiEndPoints";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { ArrowDownUp, GalleryVerticalEnd } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import Link from "next/link";
import { NetworkUtils } from "@/api/helper";
import { AddProjectDialog } from "@/components/project/create_project";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { DeleteProjectDialog } from "@/components/project/delete_project";
import { resetProject } from "@/store/slices/project";
import { useDispatch } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

export type ProjectInterface = {
  id: number;
  name: string;
  description: string;
  owner: number;
  start_date: string;
  end_date: string;
  cover_image: string | null;
  status: "planning" | "active" | "inactive" | "completed";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

interface GetProjectsInterface {
  success: boolean;
  data: {
    rows: ProjectInterface[];
    count: number;
  };
  message: string;
  code: number;
}

const Projects = () => {
  const [projects, setProjects] = useState<{
    rows: ProjectInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const router = useRouter();
  const dispatch = useDispatch();

  const [recentProjects, setRecentProjects] = useState<{
    rows: ProjectInterface[];
    count: number;
  }>({
    rows: [],
    count: 0,
  });

  const [recentProjectLoading, setRecentProjectLoading] =
    useState<boolean>(false);

  const { projectChanged: isProjectChanged } = useSelector(
    (state: RootState) => state?.project
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ASC" | "DESC";
  } | null>(null);
  const sortKey = sortConfig?.key || "id";
  const sortDirection = sortConfig?.direction || "DESC";

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const onSort = (key: string) => {
    let direction: "ASC" | "DESC" = "ASC";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ASC"
    ) {
      direction = "DESC";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = projects.count
    ? Math.ceil(projects.count / itemsPerPage)
    : 1;

  // fetch the projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await BaseClient.get<GetProjectsInterface>(
          `${projectEndPoint.getProject}?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchQuery}&sort=${sortKey}-${sortDirection}`
        );

        if (projects?.data?.success) {
          setProjects(projects?.data?.data);
        } else {
          console.error("Error fetching projects: ", projects);
        }
      } catch (error) {
        console.error("Error fetching projects: ", error);
      }
    };

    fetchProjects();

    const fetchRecentProjects = async () => {
      try {
        setRecentProjectLoading(true);
        const projects = await BaseClient.get<GetProjectsInterface>(
          `${projectEndPoint.getRecentProject}`
        );

        if (projects?.data?.success) {
          setRecentProjects(projects?.data?.data);
        } else {
          console.error("Error fetching projects: ", projects);
        }
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setRecentProjectLoading(false);
      }
    };

    if (isProjectChanged) {
      fetchRecentProjects();
    }

    dispatch(resetProject());
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchQuery,
    sortKey,
    sortDirection,
    isProjectChanged,
    dispatch,
  ]);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setRecentProjectLoading(true);
        const projects = await BaseClient.get<GetProjectsInterface>(
          `${projectEndPoint.getRecentProject}`
        );

        if (projects?.data?.success) {
          setRecentProjects(projects?.data?.data);
        } else {
          console.error("Error fetching projects: ", projects);
        }
      } catch (error) {
        console.error("Error fetching projects: ", error);
      } finally {
        setRecentProjectLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between px-6">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <AddProjectDialog />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-2">
        {/* Top Section: Recent Projects + Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analytics Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">
              Project Analytics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Total Projects */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {projects?.count || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GalleryVerticalEnd className="size-6 text-primary" />
                  </div>
                </div>
              </Card>

              {/* Active Projects */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Projects
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {projects?.rows?.filter((p) => p.status === "active")
                        .length || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="size-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* Completed Projects */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {projects?.rows?.filter((p) => p.status === "completed")
                        .length || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="size-3 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* Planning Projects */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Planning
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {projects?.rows?.filter((p) => p.status === "planning")
                        .length || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="size-3 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Project Status Distribution */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Project Status Distribution
              </h3>
              <div className="space-y-2">
                {["active", "completed", "planning", "inactive"].map(
                  (status) => {
                    const count =
                      projects?.rows?.filter((p) => p.status === status)
                        .length || 0;
                    const percentage = projects?.count
                      ? Math.round((count / projects.count) * 100)
                      : 0;

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${
                              status === "active"
                                ? "bg-green-500"
                                : status === "completed"
                                ? "bg-blue-500"
                                : status === "planning"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          <span className="text-sm capitalize">{status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === "active"
                                  ? "bg-green-500"
                                  : status === "completed"
                                  ? "bg-blue-500"
                                  : status === "planning"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          </div>
          {/* Recent Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-primary">
                Recent Projects
              </h2>
              <span className="text-sm text-muted-foreground">
                {recentProjects?.count || 0} projects
              </span>
            </div>

            {recentProjects?.count > 0 ? (
              <div className="space-y-3">
                {recentProjects?.rows?.slice(0, 3).map((project) => (
                  <Card
                    key={project.id}
                    className="w-full hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 border rounded-lg flex justify-center items-center bg-primary/10">
                            {project?.cover_image ? (
                              project.cover_image.includes("http") ? (
                                <Image
                                  src={project.cover_image}
                                  alt={project.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="text-lg font-semibold text-primary">
                                  {project.cover_image}
                                </div>
                              )
                            ) : (
                              <GalleryVerticalEnd className="size-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {project.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {project.description?.length > 50
                                ? `${project.description.substring(0, 50)}...`
                                : project.description || "No description"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === "active"
                                ? "bg-green-100 text-green-700"
                                : project.status === "completed"
                                ? "bg-blue-100 text-blue-700"
                                : project.status === "planning"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {project.status || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.start_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : recentProjectLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <Card className="w-full border-dashed">
                <CardHeader className="text-center py-8">
                  <GalleryVerticalEnd className="size-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No Recent Projects
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create your first project to get started
                  </p>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <h2 className="text-lg font-semibold ">
            All Projects {isProjectChanged}
          </h2>
          <div className="flex gap-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search Projects"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 px-4 border border-secondary rounded-sm focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          {projects?.count >= 0 ? (
            <div className="overflow-x-auto relative flex flex-col justify-between table-scroll max-h-[520px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>
                      <div className="flex gap-2 items-center">
                        Name
                        <div
                          onClick={() => onSort("name")}
                          className="cursor-pointer"
                        >
                          <ArrowDownUp className="h-4 w-4 fill-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex gap-2 items-center">
                        Description
                        <div
                          onClick={() => onSort("description")}
                          className="cursor-pointer"
                        >
                          <ArrowDownUp className="h-4 w-4 fill-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex gap-2 items-center">
                        Start Date
                        <div
                          onClick={() => onSort("start_date")}
                          className="cursor-pointer"
                        >
                          <ArrowDownUp className="h-4 w-4 fill-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex gap-2 items-center">
                        End Date
                        <div
                          onClick={() => onSort("end_date")}
                          className="cursor-pointer"
                        >
                          <ArrowDownUp className="h-4 w-4 fill-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </TableHead>

                    <TableHead>
                      <div className="flex gap-2 items-center">
                        Status
                        <div
                          onClick={() => onSort("status")}
                          className="cursor-pointer"
                        >
                          <ArrowDownUp className="h-4 w-4 fill-gray-600 text-gray-400" />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {projects?.rows?.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-100">
                      <TableCell>
                        <Link
                          href={`/projects/${item?.id}`}
                          className="text-md font-semibold text-primary"
                        >
                          {item?.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-md ">{item?.description}</div>
                      </TableCell>
                      <TableCell>
                        {NetworkUtils.formatDate(item?.start_date)}
                      </TableCell>

                      <TableCell>
                        {" "}
                        <div className="text-md">
                          {NetworkUtils.formatDate(item?.end_date)}
                        </div>
                      </TableCell>
                      <TableCell>{item?.status}</TableCell>

                      <TableCell>
                        <div className="flex gap-2 ">
                          <DeleteProjectDialog projectId={item.id} />
                          <AddProjectDialog isEditing={true} id={item?.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex max-md:flex-col max-md:gap-2  justify-between items-center px-2 pb-4 mt-4">
                <div className="h-8 flex justify-center items-center gap-4">
                  <label htmlFor="itemsPerPage" className="mr-2">
                    Items per page
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-8 px-2 border border-secondary rounded-sm focus:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed "
                  >
                    <option value={5} className="!hover:bg-primary">
                      5
                    </option>
                    <option value={10} className="!hover:bg-primary">
                      10
                    </option>
                    <option value={15} className="!hover:bg-primary">
                      15
                    </option>
                    <option value={20} className="!hover:bg-primary">
                      20
                    </option>
                  </select>
                </div>
                <div className="flex items-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      const newPage = Math.max(currentPage - 1, 1);
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === 1}
                    className={`border border-muted w-8 h-8 rounded-sm mx-2 ${
                      currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    &lt;
                  </button>

                  {/* Calculate start and end page numbers for pagination buttons */}
                  {(() => {
                    const totalButtons = 3; // Number of buttons to display
                    const halfButtons = Math.floor(totalButtons / 2);
                    let startPage = Math.max(currentPage - halfButtons, 1);
                    const endPage = Math.min(
                      startPage + totalButtons - 1,
                      totalPages
                    );

                    // Adjust start page if end page is less than totalButtons
                    if (endPage - startPage < totalButtons - 1) {
                      startPage = Math.max(endPage - totalButtons + 1, 1);
                    }

                    return Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => startPage + i
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`border ${
                          currentPage === page
                            ? "bg-primary/10 border-primary text-primary w-8 h-8 rounded-sm mx-1"
                            : "rounded-sm border-muted w-8 h-8 mx-2"
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      const newPage = Math.min(currentPage + 1, totalPages);
                      setCurrentPage(newPage);
                    }}
                    disabled={currentPage === totalPages}
                    className={`border border-muted w-8 h-8 rounded-sm mx-1 ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Loader />
          )}{" "}
        </div>
      </div>
    </div>
  );
};

export default Projects;
