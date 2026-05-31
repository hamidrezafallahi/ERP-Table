"use client";

import './myNode.css';

import {
  useEffect,
  useState,
} from 'react';

import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  Expand,
  Shrink,
  SpinIcon,
} from '@components/atoms/iconComponents';
import Title from '@components/atoms/Title';
import OrganizationChart from '@dabeng/react-orgchart';
import { useFullScreen } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';

import OrgCard from './orgCard/index';
import type {
  IOrganization,
  IRequest,
} from './type';

export default function Chart() {
  const [fullSizeChart, setFullSizeChart] = useState("chart");
  const [edges, setEdges] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [fetchApi] = useCUDDataMutation();
  const [chartData, setChartData] = useState<any>(null);

  const { locale } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  const { direction } = useAppSelector(
    (state) => ({ direction: state.withPersist.config.direction }),
    shallowEqual
  );

  const { data, isLoading, refetch } = useGetData<IOrganization[], IRequest>({
    url: "api/hr/select/organizationChart",
    body: { RepoViewId: 9002 },
  });

  const convertToOrgChartFormat = (unit: any): any => ({
    id: `node-${unit.OrganizationChartId}`,
    realId: unit.OrganizationChartId,
    name: unit.OrganizationChartName,
    title: `${unit.OrganizationChartName}`,
    images: [
      "https://fastly.picsum.photos/id/815/200/200.jpg",
      "https://picsum.photos/200/300",
      "https://picsum.photos/200",
    ],
    children: unit.SubUnits?.map(convertToOrgChartFormat) || [],
  });

  useEffect(() => {
    if (data?.Data) {
      setChartData(data.Data[0]);
    }
  }, [data]);

  const updateParent = (dataNode, childId, newParentId) => {
    if (!dataNode) return null;

    const cloneNode = JSON.parse(JSON.stringify(dataNode));

    const removeChild = (node, targetId) => {
      if (!node?.SubUnits) return node;
      node.SubUnits = node.SubUnits.map((child) =>
        removeChild(child, targetId)
      ).filter((child) => child.OrganizationChartId !== targetId);
      return node;
    };

    const findChildById = (node, id) => {
      if (node.OrganizationChartId === id) return node;
      for (const child of node.SubUnits || []) {
        const found = findChildById(child, id);
        if (found) return found;
      }
      return null;
    };

    const childNode = findChildById(cloneNode, childId);
    if (!childNode) return dataNode;

    removeChild(cloneNode, childId);

    const insertChild = (node, parentId) => {
      if (node.OrganizationChartId === parentId) {
        node.SubUnits = [...(node.SubUnits || []), childNode];
        return true;
      }
      return node.SubUnits?.some((child) => insertChild(child, parentId));
    };

    const inserted = insertChild(cloneNode, newParentId);
    if (!inserted && cloneNode.OrganizationChartId === newParentId) {
      cloneNode.SubUnits = [...(cloneNode.SubUnits || []), childNode];
    }

    return cloneNode;
  };

  const transformedData = chartData ? convertToOrgChartFormat(chartData) : null;
  const ToolbarData = ({ setFullSizeChart }) => {
    const fullscreen = useFullScreen();
    const fullScreen = useAppSelector(
      (state) => state.withPersist.config.fullScreen
    );

    const handleClick = () => {
      fullscreen();
      setTimeout(() => {
        setFullSizeChart(new Date().toISOString());
      }, 500);
    };
    return (
      <CustomButton
        ghost
        className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
        onClick={handleClick}
      >
        {fullScreen ? <Shrink /> : <Expand />}
      </CustomButton>
    );
  };

  const handleExpandToggle = (nodeId) => {
    setExpandedNodes((prev) => {
      const newExpandedNodes = new Set(prev);
      if (newExpandedNodes.has(nodeId)) {
        newExpandedNodes.delete(nodeId);
      } else {
        newExpandedNodes.add(nodeId);
      }
      return newExpandedNodes;
    });
  };

  useEffect(() => {
    setChartData((prev) => ({ ...prev }));
    setFullSizeChart(new Date().toISOString());
  }, [locale]);

  useEffect(() => {
    handleExpandToggle(1);
  }, [fullSizeChart]);

  useEffect(() => {
    setTimeout(() => {
      setFullSizeChart(new Date().toISOString());
    }, 200);
  }, [direction]);

  useEffect(() => {
    const buildEdges = (
      units: IOrganization[],
      parentId: number | null = null
    ): any[] => {
      let result = [];
      for (const unit of units) {
        if (parentId !== null) {
          result.push({
            source: `node-${parentId}`,
            target: `node-${unit.OrganizationChartId}`,
          });
        }
        if (unit.SubUnits?.length) {
          result = result.concat(
            buildEdges(unit.SubUnits, unit.OrganizationChartId)
          );
        }
      }
      return result;
    };

    if (data?.Data) {
      const edgesFromData = buildEdges(data.Data);
      setEdges(edgesFromData);
    }
  }, [data]);

  const checkLevel = (targetId: string, sourceId: string): boolean => {
    if (targetId === sourceId) return false;

    const visited = new Set<string>();
    const findParent = (id: string): string | null => {
      for (const node of edges) {
        if (node.target === id) return node.source;
      }
      return null;
    };

    let currentId: string | null = targetId;
    while (currentId) {
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      const parent = findParent(currentId);
      if (!parent) return true;
      if (parent === sourceId) return false;
      currentId = parent;
    }
    return true;
  };

  useEffect(() => {
    const handleDropEvent = async (event: CustomEvent) => {
      const { sourceId, targetId } = event.detail;

      if (sourceId === targetId) return;

      const numericSourceId = Number(sourceId.replace("node-", ""));
      const numericTargetId = Number(targetId.replace("node-", ""));
      if (numericSourceId === 1) return;
      if (!checkLevel(targetId, sourceId)) return;

      const updatedData = updateParent(
        chartData,
        numericSourceId,
        numericTargetId
      );

      setChartData(updatedData);
      setFullSizeChart(Date.now().toString());

      try {
        const result = await fetchApi({
          url: "/api/hr/update/organizationChart",
          body: {
            ChangeFields: ["OrganizationChartFatherId"],
            OrganizationChartId: numericSourceId,
            OrganizationChartFatherId: numericTargetId,
          },
        });
        if (result) {
          refetch();
        }
      } catch (err) {
        console.error("Update failed", err);
      }
    };

    window.addEventListener("orgchart-drop", handleDropEvent as EventListener);
    return () =>
      window.removeEventListener(
        "orgchart-drop",
        handleDropEvent as EventListener
      );
  }, [edges, chartData]);

  return (
    <>
      <Title caption="title.chart" />
      <div dir="ltr" className="relative w-full h-full overflow-hidden">
        <div
          className={`absolute -top-14  z-10 ${
            direction === "rtl" ? "-left-3" : "-right-3"
          }`}
        >
          <ToolbarData setFullSizeChart={setFullSizeChart} />
        </div>

        <div className="flex justify-center mx-auto lg:w-[920px] 2xl:w-[1200px] h-full !overflow-hidden text-center">
          {transformedData && (
            <OrganizationChart
              key={fullSizeChart}
              loading={isLoading}
              loadingTemplate={<SpinIcon />}
              compact
              pan
              zoom
              draggable
              chartClass="myChart"
              datasource={transformedData}
              NodeTemplate={OrgCard}
            />
          )}
        </div>
      </div>
    </>
  );
}
