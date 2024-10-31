'use client';
import React, {
  useEffect,
  useState,
  KeyboardEvent,
  useContext,
  useMemo
} from 'react';
import { PageProps } from '../../../../.next/types/app/production/[id]/page';
import { AddInput } from '../../../components/addInput/AddInput';
import { useSources } from '../../../hooks/sources/useSources';
import {
  AddSourceStatus,
  DeleteSourceStatus,
  SourceReference,
  SourceWithId
} from '../../../interfaces/Source';
import { useGetProduction, usePutProduction } from '../../../hooks/productions';
import { Production } from '../../../interfaces/production';
import { updateSetupItem } from '../../../hooks/items/updateSetupItem';
import { removeSetupItem } from '../../../hooks/items/removeSetupItem';
import { addSetupItem } from '../../../hooks/items/addSetupItem';
import HeaderNavigation from '../../../components/headerNavigation/HeaderNavigation';
import { useGetPresets } from '../../../hooks/presets';
import { Preset } from '../../../interfaces/preset';
import SourceCards from '../../../components/sourceCards/SourceCards';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { PresetDropdown } from '../../../components/startProduction/presetDropdown';
import { StartProductionButton } from '../../../components/startProduction/StartProductionButton';
import { ConfigureOutputButton } from '../../../components/startProduction/ConfigureOutputButton';
import toast from 'react-hot-toast';
import { useTranslate } from '../../../i18n/useTranslate';
import { usePipelines } from '../../../hooks/pipelines';
import { useControlPanels } from '../../../hooks/controlPanels';
import PipelineNameDropDown from '../../../components/dropDown/PipelineNameDropDown';
import ControlPanelDropDown from '../../../components/dropDown/ControlPanelDropDown';
import { Pipelines } from '../../../components/pipeline/Pipelines';
import { AddSourceModal } from '../../../components/modal/AddSourceModal';
import { RemoveSourceModal } from '../../../components/modal/RemoveSourceModal';
import { useDeleteStream, useCreateStream } from '../../../hooks/streams';
import { MonitoringButton } from '../../../components/button/MonitoringButton';
import { useGetMultiviewLayout } from '../../../hooks/multiviewLayout';
import { useMultiviews } from '../../../hooks/multiviews';
import SourceList from '../../../components/sourceList/SourceList';
import { GlobalContext } from '../../../contexts/GlobalContext';
import { Select } from '../../../components/select/Select';
import { useAddSource } from '../../../hooks/sources/useAddSource';
import { useGetFirstEmptySlot } from '../../../hooks/useGetFirstEmptySlot';
import { ConfigureMultiviewButton } from '../../../components/modal/configureMultiviewModal/ConfigureMultiviewButton';
import { useUpdateSourceInputSlotOnMultiviewLayouts } from '../../../hooks/useUpdateSourceInputSlotOnMultiviewLayouts';
import { useCheckProductionPipelines } from '../../../hooks/useCheckProductionPipelines';
import { ISource } from '../../../hooks/useDragableItems';
import { useUpdateStream } from '../../../hooks/streams';
import { usePutProductionPipelineSourceAlignmentAndLatency } from '../../../hooks/productions';
import { useIngestSourceId } from '../../../hooks/ingests';
import cloneDeep from 'lodash.clonedeep';
import {
  useAddMultiviewersOnRunningProduction,
  useRemoveMultiviewersOnRunningProduction,
  useUpdateMultiviewersOnRunningProduction
} from '../../../hooks/workflow';
import { MultiviewSettings } from '../../../interfaces/multiview';
import { CreateHtmlModal } from '../../../components/modal/renderingEngineModals/CreateHtmlModal';
import { CreateMediaModal } from '../../../components/modal/renderingEngineModals/CreateMediaModal';
import { useDeleteHtmlSource } from '../../../hooks/renderingEngine/useDeleteHtmlSource';
import { useDeleteMediaSource } from '../../../hooks/renderingEngine/useDeleteMediaSource';
import { useCreateHtmlSource } from '../../../hooks/renderingEngine/useCreateHtmlSource';
import { useCreateMediaSource } from '../../../hooks/renderingEngine/useCreateMediaSource';
import { useRenderingEngine } from '../../../hooks/renderingEngine/useRenderingEngine';

export default function ProductionConfiguration({ params }: PageProps) {
  const t = useTranslate();

  //SOURCES
  const [sources] = useSources();
  const [selectedValue, setSelectedValue] = useState<string>(
    t('production.add_other_source_type')
  );
  const [addSourceModal, setAddSourceModal] = useState(false);
  const [removeSourceModal, setRemoveSourceModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<
    SourceWithId | undefined
  >();
  const [selectedSourceRef, setSelectedSourceRef] = useState<
    SourceReference | undefined
  >();
  const [createStream, loadingCreateStream] = useCreateStream();
  const [deleteStream, loadingDeleteStream] = useDeleteStream();

  //PRODUCTION
  const putProduction = usePutProduction();
  const getPresets = useGetPresets();
  const getProduction = useGetProduction();
  const [configurationName, setConfigurationName] = useState<string>('');
  const [productionSetup, setProductionSetup] = useState<Production>();
  const [presets, setPresets] = useState<Preset[]>();
  const [selectedPreset, setSelectedPreset] = useState<Preset>();
  const selectedProductionItems =
    productionSetup?.sources.map((prod) => prod._id) || [];

  //MULTIVIEWS
  const getMultiviewLayout = useGetMultiviewLayout();
  const [updateMultiviewViews] = useMultiviews();
  const [updateSourceInputSlotOnMultiviewLayouts, updateMultiviewViewsLoading] =
    useUpdateSourceInputSlotOnMultiviewLayouts();
  const [addMultiviewersOnRunningProduction] =
    useAddMultiviewersOnRunningProduction();
  const [updateMultiviewersOnRunningProduction] =
    useUpdateMultiviewersOnRunningProduction();
  const [removeMultiviewersOnRunningProduction] =
    useRemoveMultiviewersOnRunningProduction();

  //FROM LIVE API
  const [pipelines, loadingPipelines, , refreshPipelines] = usePipelines();
  const [controlPanels, loadingControlPanels, , refreshControlPanels] =
    useControlPanels();

  //UI STATE
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [isPresetDropdownHidden, setIsPresetDropdownHidden] = useState(true);
  const [addSourceStatus, setAddSourceStatus] = useState<AddSourceStatus>();
  const [deleteSourceStatus, setDeleteSourceStatus] =
    useState<DeleteSourceStatus>();
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);

  // Create source
  const [firstEmptySlot] = useGetFirstEmptySlot();
  const [addSource] = useAddSource();

  const [updateStream, loading] = useUpdateStream();
  const [getIngestSourceId, ingestSourceIdLoading] = useIngestSourceId();

  const putProductionPipelineSourceAlignmentAndLatency =
    usePutProductionPipelineSourceAlignmentAndLatency();

  const [checkProductionPipelines] = useCheckProductionPipelines();

  // Rendering engine
  const [deleteHtmlSource, deleteHtmlLoading] = useDeleteHtmlSource();
  const [deleteMediaSource, deleteMediaLoading] = useDeleteMediaSource();
  const [createHtmlSource, createHtmlLoading] = useCreateHtmlSource();
  const [createMediaSource, createMediaLoading] = useCreateMediaSource();
  const [getRenderingEngine, renderingEngineLoading] = useRenderingEngine();

  const { locked } = useContext(GlobalContext);

  const memoizedProduction = useMemo(() => productionSetup, [productionSetup]);

  const isAddButtonDisabled =
    (selectedValue !== 'HTML' && selectedValue !== 'Media Player') || locked;

  useEffect(() => {
    console.log(
      'anything',
      !!productionSetup?.production_settings.pipelines[0]
    );
    console.log(
      'pipeline_id',
      productionSetup?.production_settings.pipelines[0].pipeline_id
    );
  }, [productionSetup?.production_settings.pipelines]);

  useEffect(() => {
    refreshPipelines();
    refreshControlPanels();
  }, [productionSetup?.isActive]);

  const setSelectedControlPanel = (controlPanel: string[]) => {
    console.log('RUNNING');
    setProductionSetup((prevState) => {
      console.log('setSelectedControlPanel - prevState:', prevState);
      if (!prevState) return;
      console.log(
        'PUT REQUEST:',
        prevState.production_settings.pipelines[0].pipeline_id
      );
      putProduction(prevState._id, {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          control_connection: {
            ...prevState?.production_settings?.control_connection,
            control_panel_name: controlPanel
          }
        }
      });
      return {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          control_connection: {
            ...prevState?.production_settings?.control_connection,
            control_panel_name: controlPanel
          }
        }
      };
    });
  };

  const setSelectedPipelineName = (
    pipelineIndex: number,
    pipelineName?: string,
    id?: string
  ) => {
    const selectedPresetCopy = cloneDeep(selectedPreset);
    const foundPipeline = selectedPresetCopy?.pipelines[pipelineIndex];
    if (foundPipeline) {
      foundPipeline.outputs = [];
      foundPipeline.pipeline_name = pipelineName;
    }
    setSelectedPreset(selectedPresetCopy);
    console.log(
      'RUNNING selectedPresetCopy',
      selectedPresetCopy?.pipelines[0].pipeline_id
    );
    console.log('RUNNING foundPipeline', foundPipeline?.pipeline_id);
    console.log(
      'RUNNING selectedPreset',
      selectedPreset?.pipelines[0].pipeline_id
    );
    setProductionSetup((prevState) => {
      console.log('setSelectedPipelineName - prevState:', prevState);
      const updatedPipelines = prevState?.production_settings.pipelines;
      if (!updatedPipelines) return;
      updatedPipelines[pipelineIndex].pipeline_name = pipelineName;
      updatedPipelines[pipelineIndex].pipeline_id = id;
      updatedPipelines[pipelineIndex].outputs = [];
      console.log(
        'PUT REQUEST:',
        prevState.production_settings.pipelines[0].pipeline_id
      );
      putProduction(prevState._id, {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          pipelines: updatedPipelines
        }
      });
      return {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          pipelines: updatedPipelines
        }
      };
    });
  };

  const refreshProduction = () => {
    getProduction(params.id).then((config) => {
      console.log(
        'REFRESH RUNNING',
        params.id,
        config.production_settings.pipelines[0].pipeline_id
      );
      // check if production has pipelines in use or control panels in use, if so update production
      const production = config.isActive
        ? config
        : checkProductionPipelines(config, pipelines);
      console.log('REFRESH pipelines', pipelines);
      console.log(
        'PUT REQUEST:',
        production.production_settings.pipelines[0].pipeline_id
      );
      putProduction(production._id, production);
      setProductionSetup(production);
      setConfigurationName(production.name);
      setSelectedPreset(production.production_settings);
      getPresets().then((presets) => {
        if (!production.production_settings) {
          setPresets(presets);
        } else {
          const presetsExludingProductionSettings = presets.filter(
            (preset) => preset._id !== production?.production_settings._id
          );
          setPresets([
            ...presetsExludingProductionSettings,
            production.production_settings
          ]);
        }
      });
    });
  };

  useEffect(() => {
    console.log('REFRESH()');
    refreshProduction();
  }, []);

  useEffect(() => {
    if (selectedValue === t('production.source')) {
      setInventoryVisible(true);
    }
  }, [selectedValue]);

  const updatePreset = (preset: Preset) => {
    if (!productionSetup?._id) return;

    const presetMultiviews = preset.pipelines[0].multiviews;
    const productionMultiviews =
      productionSetup.production_settings.pipelines[0].multiviews;

    const updatedPreset = {
      ...productionSetup,
      production_settings: {
        ...preset,
        control_connection: {
          ...preset.control_connection,
          control_panel_name:
            productionSetup.production_settings.control_connection
              .control_panel_name
        },
        pipelines: preset.pipelines.map((p, i) => {
          return {
            ...p,
            pipeline_name:
              productionSetup.production_settings.pipelines[i].pipeline_name
          };
        })
      }
    };

    if (productionSetup.isActive && presetMultiviews && productionMultiviews) {
      const productionMultiviewsMap = new Map(
        productionMultiviews.map((item) => [item.multiview_id, item])
      );
      const presetMultiviewsMap = new Map(
        presetMultiviews.map((item) => [item.multiview_id, item])
      );

      const additions: MultiviewSettings[] = [];
      const updates: MultiviewSettings[] = [];

      presetMultiviews.forEach((newItem) => {
        const oldItem = productionMultiviewsMap.get(newItem.multiview_id);

        if (!oldItem) {
          additions.push(newItem);
        } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          updates.push(newItem);
        }
      });

      const removals = productionMultiviews.filter(
        (oldItem) => !presetMultiviewsMap.has(oldItem.multiview_id)
      );

      if (additions.length > 0) {
        addMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          additions
        );
      }

      if (updates.length > 0) {
        updateMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          updates
        );
      }

      if (removals.length > 0) {
        removeMultiviewersOnRunningProduction(
          (productionSetup?._id.toString(), updatedPreset),
          removals
        );
      }
    }
    console.log(
      'PUT REQUEST:',
      updatedPreset.production_settings.pipelines[0].pipeline_id
    );
    putProduction(productionSetup?._id.toString(), updatedPreset).then(() => {
      console.log('REFRESH()');
      refreshProduction();
    });
  };

  const updateProduction = (id: string, productionSetup: Production) => {
    console.log('RUNNING');
    setProductionSetup(productionSetup);
    console.log(
      'PUT REQUEST:',
      productionSetup.production_settings.pipelines[0].pipeline_id
    );
    putProduction(id, productionSetup);
  };

  const handleSetPipelineSourceSettings = (
    source: ISource,
    sourceId: number,
    data: {
      pipeline_uuid: string;
      stream_uuid: string;
      alignment: number;
      latency: number;
    }[]
  ) => {
    if (
      productionSetup?._id &&
      source?.ingest_name &&
      source?.ingest_source_name
    ) {
      data.forEach(({ pipeline_uuid, stream_uuid, alignment, latency }) => {
        putProductionPipelineSourceAlignmentAndLatency(
          productionSetup._id,
          pipeline_uuid,
          source.ingest_name,
          source.ingest_source_name,
          alignment,
          latency
        );
        updateStream(stream_uuid, alignment);

        const updatedProduction = {
          ...productionSetup,
          productionSettings: {
            ...productionSetup.production_settings,
            pipelines: productionSetup.production_settings.pipelines.map(
              (pipeline) => {
                if (pipeline.pipeline_id === pipeline_uuid) {
                  pipeline.sources?.map((source) => {
                    if (source.source_id === sourceId) {
                      source.settings.alignment_ms = alignment;
                      source.settings.max_network_latency_ms = latency;
                    }
                  });
                }
                return pipeline;
              }
            )
          }
        };
        console.log('RUNNING');
        setProductionSetup(updatedProduction);
      });
    }
  };

  const updateMultiview = (
    source: SourceReference,
    updatedSetup: Production
  ) => {
    const pipeline = updatedSetup.production_settings.pipelines[0];

    pipeline.multiviews?.map((singleMultiview) => {
      if (
        pipeline.pipeline_id &&
        pipeline.multiviews &&
        singleMultiview.multiview_id
      ) {
        updateMultiviewViews(
          pipeline.pipeline_id,
          updatedSetup,
          source,
          singleMultiview
        );
      }
    });
  };

  const updateSource = (
    source: SourceReference,
    productionSetup: Production
  ) => {
    const updatedSetup = updateSetupItem(source, productionSetup);
    console.log('RUNNING');
    setProductionSetup(updatedSetup);
    console.log(
      'PUT REQUEST:',
      updatedSetup.production_settings.pipelines[0].pipeline_id
    );
    putProduction(updatedSetup._id.toString(), updatedSetup);
    updateMultiview(source, updatedSetup);
  };

  const updateConfigName = (nameChange: string) => {
    if (productionSetup?.name === nameChange) {
      return;
    }
    setConfigurationName(nameChange);
    const updatedSetup = {
      ...productionSetup,
      name: nameChange
    } as Production;
    console.log('RUNNING');
    setProductionSetup(updatedSetup);
    console.log(
      'PUT REQUEST:',
      updatedSetup.production_settings.pipelines[0].pipeline_id
    );
    putProduction(updatedSetup._id.toString(), updatedSetup);
  };

  async function updateSelectedPreset(preset?: Preset) {
    if (!preset && productionSetup?._id) {
      getPresets().then((presets) => {
        setPresets(presets);
      });
      setSelectedPreset(undefined);
      return;
    }
    if (!preset?.default_multiview_reference) {
      toast.error(t('production.missing_multiview'));
      return;
    }
    const defaultMultiview = await getMultiviewLayout(
      preset?.default_multiview_reference
    );
    setSelectedPreset(preset);

    const multiview = {
      layout: defaultMultiview.layout,
      output: defaultMultiview.output,
      name: defaultMultiview.name,
      for_pipeline_idx: 0
    };
    setIsPresetDropdownHidden(true);
    let controlPanelName: string[] = [];
    if (
      productionSetup?.production_settings &&
      productionSetup?.production_settings.control_connection.control_panel_name
    ) {
      // Keep the control panels name array from the current production setup
      controlPanelName =
        productionSetup.production_settings.control_connection
          .control_panel_name!;
    }

    const updatedSetup = {
      ...productionSetup,
      production_settings: {
        _id: preset._id,
        name: preset.name,
        control_connection: {
          control_panel_endpoint:
            preset.control_connection.control_panel_endpoint,
          pipeline_control_connections:
            preset.control_connection.pipeline_control_connections,
          control_panel_name: controlPanelName
        },
        pipelines: preset.pipelines
      }
    } as Production;
    updatedSetup.production_settings.pipelines[0].multiviews = [multiview];
    console.log('RUNNING');
    setProductionSetup(updatedSetup);
  }

  function addPresetComponent(preset: Preset, index: number) {
    const id = `${preset.name}-${index}-id`;
    return (
      <li
        key={preset.name + index}
        className="flex w-40 px-1 mb-1 hover:bg-gray-600"
        onClick={() => {
          updateSelectedPreset(preset);
        }}
      >
        <div className="flex items-center w-full p-2 rounded hover:bg-gray-600">
          <label
            htmlFor={id}
            className="w-full text-sm text-center font-medium"
          >
            {preset.name}
          </label>
        </div>
      </li>
    );
  }

  const addSourceAction = (source: SourceWithId) => {
    if (productionSetup && productionSetup.isActive) {
      setSelectedSource(source);
      setAddSourceModal(true);
    } else if (productionSetup) {
      const input: SourceReference = {
        _id: source._id.toString(),
        type: 'ingest_source',
        label: source.ingest_source_name,
        input_slot: firstEmptySlot(productionSetup)
      };
      addSource(input, productionSetup).then((updatedSetup) => {
        if (!updatedSetup) return;
        console.log('RUNNING');
        setProductionSetup(updatedSetup);
        setAddSourceModal(false);
        setSelectedSource(undefined);
      });
    }
  };

  const addHtmlSource = (height: number, width: number, url: string) => {
    if (productionSetup) {
      const sourceToAdd: SourceReference = {
        type: 'html',
        label: `HTML ${firstEmptySlot(productionSetup)}`,
        input_slot: firstEmptySlot(productionSetup),
        html_data: {
          height: height,
          url: url,
          width: width
        }
      };
      const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
      if (!updatedSetup) return;
      console.log('RUNNING');
      setProductionSetup(updatedSetup);
      console.log(
        'PUT REQUEST:',
        updatedSetup.production_settings.pipelines[0].pipeline_id
      );
      putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
        console.log('REFRESH()');
        refreshProduction();
      });

      if (productionSetup?.isActive && sourceToAdd.html_data) {
        createHtmlSource(
          productionSetup,
          sourceToAdd.input_slot,
          sourceToAdd.html_data,
          sourceToAdd
        );
      }
    }
  };

  const addMediaSource = (filename: string) => {
    if (productionSetup) {
      const sourceToAdd: SourceReference = {
        type: 'mediaplayer',
        label: `Media Player ${firstEmptySlot(productionSetup)}`,
        input_slot: firstEmptySlot(productionSetup),
        media_data: {
          filename: filename
        }
      };
      const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
      if (!updatedSetup) return;
      console.log('RUNNING');
      setProductionSetup(updatedSetup);
      console.log(
        'PUT REQUEST:',
        updatedSetup.production_settings.pipelines[0].pipeline_id
      );
      putProduction(updatedSetup._id.toString(), updatedSetup).then(() => {
        console.log('REFRESH()');
        refreshProduction();
      });

      if (productionSetup?.isActive && sourceToAdd.media_data) {
        createMediaSource(
          productionSetup,
          sourceToAdd.input_slot,
          sourceToAdd.media_data,
          sourceToAdd
        );
      }
    }
  };

  const isDisabledFunction = (source: SourceWithId): boolean => {
    return selectedProductionItems?.includes(source._id.toString());
  };

  const handleOpenModal = (type: 'html' | 'media') => {
    if (type === 'html') {
      setIsHtmlModalOpen(true);
    } else if (type === 'media') {
      setIsMediaModalOpen(true);
    }
  };

  const handleAddSource = async () => {
    setAddSourceStatus(undefined);
    if (
      productionSetup &&
      productionSetup.isActive &&
      selectedSource &&
      (Array.isArray(
        productionSetup?.production_settings.pipelines[0].multiviews
      )
        ? productionSetup.production_settings.pipelines[0].multiviews.some(
            (singleMultiview) => singleMultiview?.layout?.views
          )
        : false)
    ) {
      let updatedSetup = productionSetup;

      for (
        let i = 0;
        i < productionSetup.production_settings.pipelines.length;
        i++
      ) {
        const pipeline = productionSetup.production_settings.pipelines[i];

        if (!pipeline.sources) {
          pipeline.sources = [];
        }

        const newSource = {
          source_id: await getIngestSourceId(
            selectedSource.ingest_name,
            selectedSource.ingest_source_name
          ),
          settings: {
            alignment_ms: pipeline.alignment_ms,
            max_network_latency_ms: pipeline.max_network_latency_ms
          }
        };

        updatedSetup = {
          ...productionSetup,
          production_settings: {
            ...productionSetup.production_settings,
            pipelines: productionSetup.production_settings.pipelines.map(
              (p, index) => {
                if (index === i) {
                  if (!p.sources) {
                    p.sources = [];
                  }
                  p.sources.push(newSource);
                }
                return p;
              }
            )
          }
        } as Production;
      }

      const result = await createStream(
        selectedSource,
        updatedSetup,
        firstEmptySlot(productionSetup)
      );
      if (!result.ok) {
        if (!result.value) {
          setAddSourceStatus({
            success: false,
            steps: [{ step: 'add_stream', success: false }]
          });
        } else {
          setAddSourceStatus({
            success: false,
            steps: result.value.steps
          });
        }
      }
      if (result.ok) {
        if (result.value.success) {
          const sourceToAdd: SourceReference = {
            _id: result.value.streams[0].source_id,
            type: 'ingest_source',
            label: selectedSource.name,
            stream_uuids: result.value.streams.map((r) => r.stream_uuid),
            input_slot: firstEmptySlot(productionSetup)
          };
          const updatedSetup = addSetupItem(sourceToAdd, productionSetup);
          if (!updatedSetup) return;
          updateSourceInputSlotOnMultiviewLayouts(updatedSetup).then(
            (result) => {
              if (!result) return;
              console.log('RUNNING');
              setProductionSetup(result);
              updateMultiview(sourceToAdd, result);
              console.log('REFRESH()');
              refreshProduction();
              setAddSourceModal(false);
              setSelectedSource(undefined);
            }
          );
          setAddSourceStatus(undefined);
        } else {
          setAddSourceStatus({ success: false, steps: result.value.steps });
        }
      }
    }
  };

  const handleRemoveSource = async () => {
    if (productionSetup && productionSetup.isActive && selectedSourceRef) {
      const multiviews =
        productionSetup.production_settings.pipelines[0].multiviews;

      if (!multiviews || multiviews.length === 0) return;

      const viewToUpdate = multiviews.some((multiview) =>
        multiview.layout.views.find(
          (v) => v.input_slot === selectedSourceRef.input_slot
        )
      );

      if (
        selectedSourceRef.stream_uuids &&
        selectedSourceRef.stream_uuids.length > 0
      ) {
        if (!viewToUpdate) {
          if (!productionSetup.production_settings.pipelines[0].pipeline_id)
            return;

          const result = await deleteStream(
            selectedSourceRef.stream_uuids,
            productionSetup,
            selectedSourceRef.input_slot
          );

          if (!result.ok) {
            if (!result.value) {
              setDeleteSourceStatus({
                success: false,
                steps: [{ step: 'unexpected', success: false }]
              });
            } else {
              setDeleteSourceStatus({ success: false, steps: result.value });
              const didDeleteStream = result.value.some(
                (step) => step.step === 'delete_stream' && step.success
              );
              if (didDeleteStream) {
                const updatedSetup = removeSetupItem(
                  selectedSourceRef,
                  productionSetup
                );
                if (!updatedSetup) return;
                updateSourceInputSlotOnMultiviewLayouts(updatedSetup).then(
                  (result) => {
                    if (!result) return;
                    console.log('RUNNING');
                    setProductionSetup(updatedSetup);
                    updateMultiview(selectedSourceRef, result);
                    setSelectedSourceRef(undefined);
                  }
                );
                return;
              }
            }
            return;
          }

          const updatedSetup = removeSetupItem(
            selectedSourceRef,
            productionSetup
          );

          if (!updatedSetup) return;

          updateSourceInputSlotOnMultiviewLayouts(updatedSetup).then(
            (result) => {
              if (!result) return;
              console.log('RUNNING');
              setProductionSetup(updatedSetup);
              updateMultiview(selectedSourceRef, result);
              setRemoveSourceModal(false);
              setSelectedSourceRef(undefined);
            }
          );
          return;
        }

        const result = await deleteStream(
          selectedSourceRef.stream_uuids,
          productionSetup,
          selectedSourceRef.input_slot
        );

        if (!result.ok) {
          if (!result.value) {
            setDeleteSourceStatus({
              success: false,
              steps: [{ step: 'unexpected', success: false }]
            });
          } else {
            setDeleteSourceStatus({ success: false, steps: result.value });
            const didDeleteStream = result.value.some(
              (step) => step.step === 'delete_stream' && step.success
            );
            if (didDeleteStream) {
              const updatedSetup = removeSetupItem(
                selectedSourceRef,
                productionSetup
              );
              if (!updatedSetup) return;
              updateSourceInputSlotOnMultiviewLayouts(updatedSetup).then(
                (result) => {
                  if (!result) return;
                  console.log('RUNNING');
                  setProductionSetup(result);
                  updateMultiview(selectedSourceRef, result);
                }
              );
              return;
            }
          }
          return;
        }
      }

      if (
        selectedSourceRef.type === 'html' ||
        selectedSourceRef.type === 'mediaplayer'
      ) {
        for (
          let i = 0;
          i < productionSetup.production_settings.pipelines.length;
          i++
        ) {
          const pipelineId =
            productionSetup.production_settings.pipelines[i].pipeline_id;
          if (pipelineId) {
            getRenderingEngine(pipelineId);
            if (selectedSourceRef.type === 'html') {
              await deleteHtmlSource(
                pipelineId,
                selectedSourceRef.input_slot,
                productionSetup
              );
            } else if (selectedSourceRef.type === 'mediaplayer') {
              await deleteMediaSource(
                pipelineId,
                selectedSourceRef.input_slot,
                productionSetup
              );
            }
          }
        }
      }

      const updatedSetup = removeSetupItem(selectedSourceRef, productionSetup);

      if (!updatedSetup) return;
      updateSourceInputSlotOnMultiviewLayouts(updatedSetup).then((result) => {
        if (!result) return;
        console.log('RUNNING');
        setProductionSetup(result);
        updateMultiview(selectedSourceRef, result);
        setRemoveSourceModal(false);
        setSelectedSourceRef(undefined);
      });
    }
  };

  const handleAbortAddSource = () => {
    setAddSourceStatus(undefined);
    setAddSourceModal(false);
    setSelectedSource(undefined);
  };

  const handleAbortRemoveSource = () => {
    setRemoveSourceModal(false);
    setSelectedSource(undefined);
    setDeleteSourceStatus(undefined);
  };

  const hasSelectedPipelines = () => {
    if (!productionSetup?.production_settings?.pipelines?.length) return false;
    let allPipesHaveName = true;
    productionSetup.production_settings.pipelines.forEach((p) => {
      if (!p.pipeline_name) allPipesHaveName = false;
    });
    return allPipesHaveName;
  };

  return (
    <>
      <HeaderNavigation>
        <input
          className="m-2 text-4xl text-p bg-transparent grow text-start"
          type="text"
          value={configurationName}
          onChange={(e) => {
            setConfigurationName(e.target.value);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key.includes('Enter')) {
              e.currentTarget.blur();
            }
          }}
          onBlur={() => updateConfigName(configurationName)}
          disabled={locked}
        />
        <div
          className="flex mr-2 w-fit rounded justify-end items-center gap-3"
          key={'StartProductionButtonKey'}
          id="presetDropdownDefaultCheckbox"
        >
          <PresetDropdown
            disabled={
              (productionSetup ? productionSetup.isActive : false) || locked
            }
            isHidden={isPresetDropdownHidden}
            setHidden={setIsPresetDropdownHidden}
            selectedPreset={selectedPreset}
            onSelectPreset={() => {
              updateSelectedPreset(undefined);
            }}
          >
            {presets &&
              presets.map((item, index) => {
                return addPresetComponent(item, index);
              })}
          </PresetDropdown>
          <ConfigureOutputButton
            disabled={
              productionSetup?.isActive || locked || !hasSelectedPipelines()
            }
            preset={selectedPreset}
            updatePreset={updatePreset}
          />
          <ConfigureMultiviewButton
            disabled={locked || !hasSelectedPipelines()}
            preset={selectedPreset}
            updatePreset={updatePreset}
            production={memoizedProduction}
          />
          <StartProductionButton
            refreshProduction={() => {
              console.log('REFRESH()');
              refreshProduction();
            }}
            production={productionSetup}
            disabled={
              (!selectedPreset ? true : false) ||
              locked ||
              !hasSelectedPipelines()
            }
          />
        </div>
      </HeaderNavigation>
      <div className="flex h-[95%] flex-row">
        <div
          className={`overflow-hidden transition-[min-width] w-0 ${
            inventoryVisible ? 'min-w-fit ml-2 mt-2 max-h-[89vh]' : 'min-w-0'
          }`}
        >
          <SourceList
            sources={sources}
            action={addSourceAction}
            actionText={'add'}
            onClose={() => setInventoryVisible(false)}
            isDisabledFunc={isDisabledFunction}
            locked={locked}
          />
          {addSourceModal && (selectedSource || selectedSourceRef) && (
            <AddSourceModal
              name={selectedSource?.name || selectedSourceRef?.label || ''}
              open={addSourceModal}
              onAbort={handleAbortAddSource}
              onConfirm={handleAddSource}
              status={addSourceStatus}
              loading={loadingCreateStream || updateMultiviewViewsLoading}
              locked={locked}
            />
          )}
        </div>
        <div
          className={`flex flex-col h-fit mt-2 ${
            inventoryVisible ? 'w-fit' : 'w-full'
          }`}
        >
          <div
            id="prevCameras"
            className="grid p-3 m-2 bg-container grow rounded grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 h-fit"
          >
            {productionSetup?.sources && sources.size > 0 && (
              <DndProvider backend={HTML5Backend}>
                <SourceCards
                  onConfirm={handleSetPipelineSourceSettings}
                  productionSetup={productionSetup}
                  locked={locked}
                  updateProduction={(updated) => {
                    updateProduction(productionSetup._id, updated);
                  }}
                  onSourceUpdate={(source: SourceReference) => {
                    updateSource(source, productionSetup);
                  }}
                  onSourceRemoval={(source: SourceReference) => {
                    if (productionSetup && productionSetup.isActive) {
                      setSelectedSourceRef(source);
                      setRemoveSourceModal(true);
                    } else if (productionSetup) {
                      const updatedSetup = removeSetupItem(
                        {
                          _id: source._id,
                          type: source.type,
                          label: source.label,
                          input_slot: source.input_slot
                        },
                        productionSetup
                      );
                      if (!updatedSetup) return;
                      console.log('RUNNING');
                      setProductionSetup(updatedSetup);
                      console.log(
                        'PUT REQUEST:',
                        updatedSetup.production_settings.pipelines[0]
                          .pipeline_id
                      );
                      putProduction(
                        updatedSetup._id.toString(),
                        updatedSetup
                      ).then(() => {
                        setRemoveSourceModal(false);
                        setSelectedSourceRef(undefined);
                      });
                    }
                  }}
                  loading={loading}
                />
                {removeSourceModal && selectedSourceRef && (
                  <RemoveSourceModal
                    name={selectedSourceRef.label}
                    open={removeSourceModal}
                    onAbort={handleAbortRemoveSource}
                    onConfirm={handleRemoveSource}
                    status={deleteSourceStatus}
                    loading={
                      loadingDeleteStream ||
                      deleteHtmlLoading ||
                      deleteMediaLoading ||
                      updateMultiviewViewsLoading
                    }
                  />
                )}
              </DndProvider>
            )}
            <div className="bg-zinc-700 aspect-video m-2 p-2 text-p border-2 border-zinc-300 rounded flex flex-col gap-2 justify-center items-center">
              <AddInput
                onClickSource={() => setInventoryVisible(true)}
                disabled={
                  productionSetup?.production_settings === undefined ||
                  productionSetup.production_settings === null ||
                  locked
                }
              />
              <div className="flex flex-row">
                <Select
                  classNames="w-full"
                  disabled={
                    productionSetup?.production_settings === undefined ||
                    productionSetup.production_settings === null ||
                    locked
                  }
                  options={[
                    t('production.add_other_source_type'),
                    'HTML',
                    'Media Player'
                  ]}
                  value={selectedValue}
                  onChange={(e) => {
                    setSelectedValue(e.target.value);
                  }}
                />
                <button
                  className={`p-1.5 rounded ml-2 ${
                    isAddButtonDisabled
                      ? 'bg-zinc-500/50 text-white/50'
                      : 'bg-zinc-500 text-white'
                  }`}
                  onClick={() =>
                    handleOpenModal(selectedValue === 'HTML' ? 'html' : 'media')
                  }
                  disabled={isAddButtonDisabled}
                >
                  {t('production.add')}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-2 p-3">
            {productionSetup?.production_settings &&
              productionSetup?.production_settings.pipelines.map(
                (pipeline, i) => {
                  return (
                    <PipelineNameDropDown
                      disabled={productionSetup.isActive || locked}
                      key={pipeline.pipeline_readable_name + i}
                      label={pipeline.pipeline_readable_name}
                      options={pipelines?.map((pipeline) => ({
                        option: pipeline.name,
                        id: pipeline.uuid,
                        available: pipeline.streams.length === 0
                      }))}
                      pipelineIndex={i}
                      initial={pipeline.pipeline_name}
                      setSelectedPipelineName={setSelectedPipelineName}
                    />
                  );
                }
              )}
            {productionSetup?.production_settings && (
              <ControlPanelDropDown
                disabled={productionSetup.isActive || locked}
                options={controlPanels?.map((controlPanel) => ({
                  option: controlPanel.name,
                  available: controlPanel.outgoing_connections?.length === 0
                }))}
                initial={
                  productionSetup?.production_settings?.control_connection
                    .control_panel_name
                }
                setSelectedControlPanel={setSelectedControlPanel}
              />
            )}
            <div className="w-full flex justify-end">
              <Pipelines production={productionSetup} />
            </div>
          </div>
          {productionSetup && productionSetup.isActive && (
            <div className="flex justify-end p-3">
              <MonitoringButton id={productionSetup?._id.toString()} />
            </div>
          )}
        </div>
        <CreateHtmlModal
          open={isHtmlModalOpen}
          onAbort={() => setIsHtmlModalOpen(false)}
          onConfirm={addHtmlSource}
          loading={createHtmlLoading}
        />
        <CreateMediaModal
          open={isMediaModalOpen}
          onAbort={() => setIsMediaModalOpen(false)}
          onConfirm={addMediaSource}
          loading={createMediaLoading}
        />
      </div>
    </>
  );
}
