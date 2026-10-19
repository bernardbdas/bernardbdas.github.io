/**
 * projects.ts — Production AI/ML & Distributed Systems Data Model
 * Powers both the portfolio project cards and the interactive ProjectDemoModal.
 */

export interface TerminalLogLine {
  time: string;
  level: 'INIT' | 'INFO' | 'METRIC' | 'SUCCESS' | 'WARN';
  message: string;
}

export interface ArchitectureNode {
  name: string;
  role: string;
  tech: string;
}

export interface ProjectDemo {
  videoSrc?: string;
  embedUrl?: string;
  duration?: string;
  summary: string;
  terminalCmd: string;
  terminalLogs: TerminalLogLine[];
  architecture: {
    summary: string;
    nodes: ArchitectureNode[];
    pipeline: string[];
    benchmarks: { label: string; value: string; delta: string }[];
  };
}

export interface Project {
  id: string;
  name: string;
  category: string;
  metric: string;
  desc: string;
  highlights: string[];
  tags: string[];
  githubUrl: string;
  demo: ProjectDemo;
}

export const projects: Project[] = [
  {
    id: 'SYS_01',
    name: 'Autonomous Multi-Agent GraphRAG & Financial Intelligence Engine',
    category: 'AGENTIC AI & KNOWLEDGE GRAPHS',
    metric: '<120ms TTFT // 94.2% Multi-Hop Precision',
    desc: 'Production-grade hierarchical multi-agent network orchestrated with DSPy and LangGraph. Ingests raw SEC 10-K/10-Q filings, earnings transcripts, and live market news feeds. Features self-correcting query decomposition, ColBERT hybrid dense-sparse retrieval, knowledge graph traversal in Neo4j, and structured JSON output verification.',
    highlights: [
      'Multi-hop reasoning with GraphRAG resolving complex cross-document financial dependencies',
      'Hybrid dense-sparse reranking combining ColBERTv2 with SPLADE for high recall',
      'Dynamic agent tooling with automatic retry and schema-constrained decoding',
    ],
    tags: ['LangGraph', 'DSPy', 'ColBERTv2', 'Neo4j', 'Qdrant', 'vLLM', 'SGLang', 'Docker'],
    githubUrl: 'https://github.com/bernardbdas/agentic-graphrag-engine',
    demo: {
      duration: '01:24',
      summary:
        'Live execution of multi-hop financial query decomposition, Neo4j entity linking, and verified schema synthesis across SEC filings.',
      terminalCmd:
        'python -m graphrag.orchestrator --query "Evaluate semiconductor supply chain risk & margin exposure from 10-K filings" --concurrency 16',
      terminalLogs: [
        {
          time: '00:00.041',
          level: 'INIT',
          message: 'Orchestrator node booted. DSPy teleprompter compiled.',
        },
        {
          time: '00:00.108',
          level: 'INFO',
          message: 'Decomposing root prompt into 4 sub-agent execution branches.',
        },
        {
          time: '00:00.185',
          level: 'INFO',
          message: 'Querying Qdrant collection [sec_filings_2024] via ColBERTv2.',
        },
        {
          time: '00:00.274',
          level: 'METRIC',
          message: 'Hybrid Recall@20: 97.4% (Dense: 0.88, Sparse SPLADE: 0.91).',
        },
        {
          time: '00:00.380',
          level: 'INFO',
          message: 'Traversing Neo4j entity graph: (:Company)->[:SUPPLIER_TO]->(:Foundry).',
        },
        {
          time: '00:00.512',
          level: 'METRIC',
          message: 'Multi-hop graph traversal resolved 14 dependency edges in 13.8ms.',
        },
        {
          time: '00:00.684',
          level: 'INFO',
          message: 'Streaming structured financial synthesis through vLLM JSON-grammar engine.',
        },
        {
          time: '00:00.822',
          level: 'SUCCESS',
          message: 'Audit complete. TTFT: 118ms. Schema validation: 100% PASS.',
        },
      ],
      architecture: {
        summary:
          'Hierarchical supervisor orchestrating specialized retrieval agents, dense-sparse rerankers, and graph databases with constrained grammar decoders.',
        nodes: [
          {
            name: 'Supervisor Agent',
            role: 'Query planning & task allocation',
            tech: 'LangGraph + DSPy',
          },
          {
            name: 'Dense-Sparse Index',
            role: 'Sub-token vector & lexical retrieval',
            tech: 'Qdrant + ColBERTv2',
          },
          {
            name: 'Knowledge Graph',
            role: 'Entity ontology & supply chain traversal',
            tech: 'Neo4j Cypher Engine',
          },
          {
            name: 'Inference Serving',
            role: 'Constrained JSON schema generation',
            tech: 'vLLM + SGLang',
          },
        ],
        pipeline: [
          'Raw SEC Filings Ingestion & Markdown AST Parsing',
          'Entity & Relation Extraction with Graph Triplets',
          'ColBERT Multi-Vector Token Interaction Reranker',
          'Hierarchical Multi-Agent Graph Traversal',
          'Pydantic Schema Validation & TTFT Verification',
        ],
        benchmarks: [
          { label: 'Time to First Token (TTFT)', value: '118ms', delta: '-64% vs LangChain' },
          { label: 'Multi-Hop Extraction Precision', value: '94.2%', delta: '+18.6% vs Naive RAG' },
          { label: 'Retrieval Latency (p99)', value: '38ms', delta: '4.2x Faster' },
        ],
      },
    },
  },
  {
    id: 'SYS_02',
    name: 'Distributed 3D-Parallel Foundation Model Pre-Training & Alignment Cluster',
    category: 'DISTRIBUTED HPC & POST-TRAINING',
    metric: '48.2% MFU // 32x H100 Scale // 32k Long-Context',
    desc: 'Scalable distributed training harness engineered for pre-training and alignment of a 14B Mixture-of-Experts (MoE) foundation model. Coordinates 3D parallelism across multi-node GPU clusters using PyTorch FSDP, DeepSpeed ZeRO-3, and Megatron-LM. Fine-tuned with Direct Preference Optimization (DPO) and online PPO/GRPO reinforcement learning.',
    highlights: [
      'Achieved 48.2% Model FLOPs Utilization (MFU) with zero gradient divergence across 32k context lengths',
      'Automated activation checkpointing and ZeRO-Offload eliminating OOM bottlenecks',
      'Integrated synthetic data generation and automated safety/bias evaluation benchmarks',
    ],
    tags: [
      'PyTorch FSDP',
      'DeepSpeed ZeRO-3',
      'Megatron-LM',
      'FlashAttention-3',
      'Ray Train',
      'TRL',
      'Slurm',
      'NCCL',
    ],
    githubUrl: 'https://github.com/bernardbdas/distributed-moe-cluster',
    demo: {
      duration: '02:08',
      summary:
        'Multi-node distributed pre-training run coordinating 3D parallelism across 32x H100 GPUs with NCCL ring telemetry and live loss convergence.',
      terminalCmd:
        'srun --nodes=4 --gpus-per-node=8 torchrun --nproc_per_node=8 train_moe_cluster.py --config configs/14b_moe_32k.yaml',
      terminalLogs: [
        {
          time: '00:00.120',
          level: 'INIT',
          message: 'Initializing NCCL comms world_size=32, backend=nccl, proto=IBGDA.',
        },
        {
          time: '00:00.340',
          level: 'INFO',
          message: 'Configuring 3D Parallelism: TP=4, PP=2, DP=4 (FSDP ZeRO-3 Stage).',
        },
        {
          time: '00:00.612',
          level: 'INFO',
          message: 'Allocating FlashAttention-3 long-context kernels for seq_len=32768.',
        },
        {
          time: '00:01.045',
          level: 'METRIC',
          message: 'All-to-All Dispatch Latency for MoE Experts: 4.1ms per rank.',
        },
        {
          time: '00:02.190',
          level: 'INFO',
          message: 'Step 100/50000 | Loss: 2.148 | Grad Norm: 0.84 | Learning Rate: 3e-4.',
        },
        {
          time: '00:03.410',
          level: 'METRIC',
          message: 'Achieved Hardware Model FLOPs Utilization (MFU): 48.2% on H100 SXM5.',
        },
        {
          time: '00:04.220',
          level: 'INFO',
          message: 'Automated activation checkpointing checkpoint saved to shared NVMe array.',
        },
        {
          time: '00:05.100',
          level: 'SUCCESS',
          message: 'Gradient sync verified. Zero NaN/Inf anomalies detected across all ranks.',
        },
      ],
      architecture: {
        summary:
          'Multi-node HPC orchestration pipeline leveraging Tensor, Pipeline, and Sharded Data Parallelism for long-context MoE foundation models.',
        nodes: [
          {
            name: 'Coordination Master',
            role: 'Slurm job scheduler & telemetry aggregator',
            tech: 'Slurm + Ray Train',
          },
          {
            name: 'NCCL Communication Fabric',
            role: 'High-speed inter-node All-Reduce & All-to-All',
            tech: 'InfiniBand HDR 800Gb/s',
          },
          {
            name: 'Model Kernel Engine',
            role: 'Memory-bandwidth optimized attention',
            tech: 'FlashAttention-3 + Triton',
          },
          {
            name: 'Alignment Engine',
            role: 'Direct preference optimization & RLHF',
            tech: 'TRL + DeepSpeed ZeRO-3',
          },
        ],
        pipeline: [
          'Pre-Tokenized Synthetic Dataset Streaming via Ray Data',
          '3D Parallel Domain Decomposition (TP=4, PP=2, DP=4)',
          'FlashAttention-3 Ring Attention across 32k Context',
          'Dynamic Expert Routing & Load-Balanced Gating',
          'Gradient Sharding & Checkpointing with ZeRO-3',
        ],
        benchmarks: [
          {
            label: 'Model FLOPs Utilization (MFU)',
            value: '48.2%',
            delta: '+14% vs Baseline FSDP',
          },
          { label: 'Max Context Window', value: '32,768 Tokens', delta: '4x Memory Reduction' },
          { label: 'Inter-Node All-Reduce Latency', value: '4.1ms', delta: '99.8% Bus Saturation' },
        ],
      },
    },
  },
  {
    id: 'SYS_03',
    name: 'Ultra-Low-Latency Real-Time LLM Serving Mesh with Speculative Decoding',
    category: 'INFERENCE ACCEL & CUSTOM KERNELS',
    metric: '4.2x Throughput // 68% p99 Latency Drop // 38% Cache Hit',
    desc: 'High-throughput distributed model serving pipeline built for real-time generative workloads. Combines vLLM continuous batching and chunked prefill with speculative draft decoding (1.5B draft assisting 70B target). Features custom OpenAI Triton kernels for fused rotary embeddings and dynamic FP8/AWQ quantization.',
    highlights: [
      '4.2x throughput increase over baseline serving with sub-32ms per-token generation latency',
      'Custom OpenAI Triton kernels fusing layer norms and dynamic quantization for memory bandwidth savings',
      'Redis-backed semantic response cache reducing redundant GPU compute by 38%',
    ],
    tags: [
      'vLLM',
      'TensorRT-LLM',
      'OpenAI Triton',
      'CUDA C++',
      'Redis',
      'Prometheus',
      'Grafana',
      'C++20',
    ],
    githubUrl: 'https://github.com/bernardbdas/vllm-speculative-serving-mesh',
    demo: {
      duration: '01:45',
      summary:
        'Live speculative draft verification benchmark comparing standard vLLM serving against speculative 1.5B/70B coupled engine.',
      terminalCmd:
        'python -m vllm_mesh.bench --target meta-llama/Llama-3-70B --draft meta-llama/Llama-3.2-1B --concurrency 64 --speculative-steps 5',
      terminalLogs: [
        {
          time: '00:00.050',
          level: 'INIT',
          message: 'Loading custom Triton fused RoPE + FP8 kernels into GPU memory.',
        },
        {
          time: '00:00.220',
          level: 'INFO',
          message: 'Connecting Redis semantic embedding cache at localhost:6379.',
        },
        {
          time: '00:00.410',
          level: 'INFO',
          message: 'Starting continuous batching engine with PagedAttention-v2.',
        },
        {
          time: '00:00.820',
          level: 'METRIC',
          message: 'Draft Model (1.5B) speculation rate: 4.3 tokens accepted per draft cycle.',
        },
        {
          time: '00:01.150',
          level: 'METRIC',
          message: 'Speculative acceptance rate: 78.4% on GSM8K/HumanEval validation.',
        },
        {
          time: '00:01.890',
          level: 'INFO',
          message: 'Incoming batch size: 64 concurrent requests. Chunked prefill active.',
        },
        {
          time: '00:02.450',
          level: 'METRIC',
          message: 'Generation throughput: 1,842 tokens/sec (4.2x baseline speedup).',
        },
        {
          time: '00:03.110',
          level: 'SUCCESS',
          message: 'p99 latency: 28.4ms per token. Zero KV cache memory leaks detected.',
        },
      ],
      architecture: {
        summary:
          'Distributed inference serving cluster pairing a compact draft model with a large target model using Triton-accelerated continuous batching.',
        nodes: [
          {
            name: 'API Router & Semantic Cache',
            role: 'Request deduplication & embedding routing',
            tech: 'FastAPI + Redis Vector',
          },
          {
            name: 'Draft Model Engine',
            role: 'Speculative 5-token candidate proposer',
            tech: 'vLLM 1.5B Worker',
          },
          {
            name: 'Target Verification Engine',
            role: 'Parallel KV-cache speculative validation',
            tech: 'TensorRT-LLM 70B TP=4',
          },
          {
            name: 'Custom Triton Kernels',
            role: 'Fused normalization and FP8 dynamic scaling',
            tech: 'OpenAI Triton + CUDA C++',
          },
        ],
        pipeline: [
          'Semantic Similarity Check on Query via Redis Vector Cache',
          'Speculative Draft Generation (5 Tokens at 2ms/token)',
          'Single-Pass Target Model Verification Kernel',
          'Dynamic Rejection Sampling & Context Continuation',
          'Real-Time Prometheus & Grafana Telemetry Streaming',
        ],
        benchmarks: [
          { label: 'Overall Serving Throughput', value: '1,842 tok/s', delta: '4.2x Faster' },
          { label: 'p99 Token Generation Latency', value: '28.4ms', delta: '-68% Latency' },
          { label: 'Semantic GPU Compute Avoidance', value: '38.2%', delta: 'Zero Quality Loss' },
        ],
      },
    },
  },
  {
    id: 'SYS_04',
    name: 'Self-Healing Enterprise MLOps Platform & Continuous Evaluation Mesh',
    category: 'CLOUD MLOPS & PRODUCTION INFRA',
    metric: '99.99% Uptime // Sub-Second GPU HPA // Zero-Downtime Rollouts',
    desc: 'Cloud-native automated MLOps platform managing the entire model lifecycle from automated data validation to zero-downtime canary deployments on Kubernetes. Features real-time feature and concept drift monitoring that automatically triggers active learning re-training pipelines, backed by automated LLM-as-a-Judge evaluation suites.',
    highlights: [
      'Automated drift detection via Evidently AI triggering zero-touch re-training in Argo Workflows',
      'Sub-second Horizontal Pod Autoscaling (HPA) using custom GPU utilization metrics on KEDA',
      'Automated rollback mechanisms preventing production degradation during model upgrades',
    ],
    tags: [
      'Kubernetes',
      'KServe',
      'KubeRay',
      'MLflow',
      'Argo Workflows',
      'Evidently AI',
      'Langfuse',
      'AWS SageMaker',
    ],
    githubUrl: 'https://github.com/bernardbdas/enterprise-mlops-platform',
    demo: {
      duration: '01:32',
      summary:
        'Live demonstration of automated data drift detection, KEDA sub-second GPU autoscaling, and zero-downtime canary rollback.',
      terminalCmd:
        'kubectl get pods -n mlops-prod --watch & python simulate_production_drift.py --drift-ratio 0.42',
      terminalLogs: [
        {
          time: '00:00.080',
          level: 'INIT',
          message: 'Kubernetes cluster connected. 18 GPU nodes active across 3 availability zones.',
        },
        {
          time: '00:00.240',
          level: 'INFO',
          message: 'Evidently AI streaming statistical telemetry on inference inputs.',
        },
        {
          time: '00:00.610',
          level: 'WARN',
          message:
            'Feature drift detected on column [user_embedding_dim_14]: KS test p-val < 0.001.',
        },
        {
          time: '00:00.950',
          level: 'INFO',
          message: 'Triggering Argo Workflow [auto-retrain-pipeline-v4.8] via webhook.',
        },
        {
          time: '00:01.420',
          level: 'INFO',
          message: 'KEDA scaling serving deployment from 4 pods to 12 pods (GPU load 88%).',
        },
        {
          time: '00:02.100',
          level: 'METRIC',
          message: 'New model artifact validated via LLM-as-a-Judge benchmark: Score 92.4/100.',
        },
        {
          time: '00:02.850',
          level: 'INFO',
          message: 'Initiating 10% canary traffic rollout on KServe Istio ingress.',
        },
        {
          time: '00:03.320',
          level: 'SUCCESS',
          message: 'Zero downtime achieved. All health probes green. Rollout promoted to 100%.',
        },
      ],
      architecture: {
        summary:
          'Kubernetes-native MLOps architecture automating drift detection, autoscaling, reproducible training, and progressive traffic routing.',
        nodes: [
          {
            name: 'Drift & Quality Monitor',
            role: 'Real-time statistical anomaly detection',
            tech: 'Evidently AI + Langfuse',
          },
          {
            name: 'Workflow Orchestrator',
            role: 'DAG-based automated training & validation',
            tech: 'Argo Workflows + MLflow',
          },
          {
            name: 'Event-Driven Autoscaler',
            role: 'GPU queue-depth & request latency scaling',
            tech: 'KEDA + Kubernetes HPA',
          },
          {
            name: 'Model Mesh Serving',
            role: 'Canary deployments & shadow traffic testing',
            tech: 'KServe + Istio Mesh',
          },
        ],
        pipeline: [
          'Inference Input Stream Monitoring & Feature Drift Extraction',
          'Automated Training Trigger via Argo Event Bus',
          'Distributed Fine-Tuning Run on KubeRay Cluster',
          'LLM-as-a-Judge Safety & Accuracy Evaluation Gate',
          'Automated Canary Ingress Shift (10% -> 50% -> 100%)',
        ],
        benchmarks: [
          { label: 'Cluster Service Uptime', value: '99.99%', delta: 'Zero Outages' },
          { label: 'Autoscaling Reaction Time', value: '820ms', delta: 'Sub-Second Scaling' },
          {
            label: 'Rollback Safety Verification',
            value: '100% Automated',
            delta: 'Zero Production Defects',
          },
        ],
      },
    },
  },
  {
    id: 'SYS_05',
    name: 'Multi-Modal Vision-Language Edge Perception System',
    category: 'EDGE AI & EMBEDDED ACCELERATION',
    metric: '60 FPS Real-Time (<18ms) // 75% Memory Cut // <25W Power',
    desc: 'Ultra-efficient edge vision-language reasoning engine deployed on NVIDIA Jetson AGX Orin for autonomous robotics and situational awareness. Features 4-bit AWQ weight quantization, TensorRT acceleration, open-vocabulary object grounding, and temporal video stream comprehension under strict embedded power constraints.',
    highlights: [
      'Sub-18ms end-to-end perception latency at 60 FPS running entirely within a 25W power envelope',
      '75% memory footprint reduction via 4-bit INT4 quantization without loss in mean Average Precision (mAP)',
      'Direct integration with ROS2 middleware for real-time sensor fusion and spatial tracking',
    ],
    tags: ['PyTorch', 'TensorRT', 'AWQ', 'OpenCV', 'ONNX Runtime', 'FastSAM', 'ROS2', 'Modern C++'],
    githubUrl: 'https://github.com/bernardbdas/edge-vlm-perception',
    demo: {
      duration: '01:18',
      summary:
        'Edge perception execution on NVIDIA Jetson AGX Orin showing 60 FPS open-vocabulary detection and 4-bit AWQ inference.',
      terminalCmd:
        './bin/edge_vlm_node --camera /dev/video0 --engine models/yolo_vlm_4bit.engine --power-mode MAXN_25W',
      terminalLogs: [
        {
          time: '00:00.035',
          level: 'INIT',
          message: 'Initializing TensorRT 10.2 runtime on NVIDIA Jetson Orin 64GB.',
        },
        {
          time: '00:00.120',
          level: 'INFO',
          message: 'Opening ROS2 perception node: /camera/color/image_raw.',
        },
        {
          time: '00:00.280',
          level: 'INFO',
          message: 'Loading 4-bit AWQ quantized vision backbone. Memory allocation: 3.2 GB.',
        },
        {
          time: '00:00.410',
          level: 'METRIC',
          message: 'INT4 Tensor Core utilization: 92.4%. Frame pre-processing: 1.8ms.',
        },
        {
          time: '00:00.750',
          level: 'INFO',
          message: 'Prompt received: "Identify moving hazards and spatial distance".',
        },
        {
          time: '00:00.910',
          level: 'METRIC',
          message: 'Perception pipeline cycle: 15.6ms (Equivalent to 64.1 FPS sustained).',
        },
        {
          time: '00:01.240',
          level: 'METRIC',
          message: 'System power consumption: 21.8 Watts (Threshold: 25.0W).',
        },
        {
          time: '00:01.880',
          level: 'SUCCESS',
          message:
            'Real-time hazard detections published to ROS2 topic: /perception/bounding_boxes.',
        },
      ],
      architecture: {
        summary:
          'Embedded perception pipeline integrating quantized vision transformers with ROS2 middleware for real-time spatial intelligence.',
        nodes: [
          {
            name: 'Hardware Platform',
            role: 'Embedded AI edge computer',
            tech: 'NVIDIA Jetson AGX Orin',
          },
          {
            name: 'Quantized Vision Core',
            role: '4-bit accelerated reasoning transformer',
            tech: 'TensorRT + AWQ INT4',
          },
          {
            name: 'Sensor Fusion Pipeline',
            role: 'Real-time frame ingestion & stereo depth',
            tech: 'OpenCV + CUDA Kernels',
          },
          {
            name: 'Robotics Middleware',
            role: 'Zero-copy inter-process communication',
            tech: 'ROS2 Humble + C++20',
          },
        ],
        pipeline: [
          'Real-Time Camera Frame Acquisition (60 FPS)',
          'CUDA-Accelerated Image Normalization & Tensor Mapping',
          'TensorRT INT4 Vision-Language Forward Pass',
          'Open-Vocabulary Object Grounding & Spatial Depth Mapping',
          'ROS2 Topic Publishing for Autonomous Navigation',
        ],
        benchmarks: [
          { label: 'Sustained Frame Rate', value: '64.1 FPS', delta: '+2.1x over FP16' },
          { label: 'Total Processing Latency', value: '15.6ms', delta: 'Real-Time Edge Capable' },
          { label: 'Power Consumption', value: '21.8 Watts', delta: 'Under 25W Thermal Limit' },
        ],
      },
    },
  },
  {
    id: 'SYS_06',
    name: 'Real-Time Streaming Feature Store & Dual-Stage Recommendation Mesh',
    category: 'STREAMING DATA & HIGH-THROUGHPUT RECSYS',
    metric: '<18ms p99 at 75k QPS // Feature Freshness <150ms',
    desc: 'High-velocity personalization pipeline processing 100k+ events/sec. Dual-stage retrieval architecture: candidate generation via Two-Tower embedding indexing in ScaNN, followed by deep transformer ranking (DLRM) served through Triton Inference Server, with strict point-in-time correctness to eliminate train-serve skew.',
    highlights: [
      'Processes 75,000 queries per second with p99 latency strictly below 18ms',
      'Sub-150ms real-time feature updates using Apache Kafka and Apache Flink stateful streams',
      'Feast-managed feature registry guaranteeing zero data leakage between training and serving',
    ],
    tags: [
      'Apache Kafka',
      'Apache Flink',
      'Feast',
      'Redis',
      'Triton Inference Server',
      'PyTorch DLRM',
      'ScaNN',
      'DuckDB',
    ],
    githubUrl: 'https://github.com/bernardbdas/streaming-feature-store-recsys',
    demo: {
      duration: '01:50',
      summary:
        'Load testing streaming event ingestion at 100k events/sec and evaluating dual-stage recommendation latency under 75k QPS.',
      terminalCmd:
        'ghz --insecure --proto=proto/recsys.proto --call=RecSys.GetRecommendations -n 100000 -c 256 localhost:8001',
      terminalLogs: [
        {
          time: '00:00.040',
          level: 'INIT',
          message: 'Connecting Feast Feature Store online registry with Redis cluster.',
        },
        {
          time: '00:00.180',
          level: 'INFO',
          message: 'Consuming from Kafka topic: user-clickstream (Partition count: 32).',
        },
        {
          time: '00:00.410',
          level: 'METRIC',
          message: 'Flink stateful streaming feature freshness: 112ms end-to-end.',
        },
        {
          time: '00:00.890',
          level: 'INFO',
          message: 'Stage 1: Candidate retrieval querying ScaNN index for top-500 candidates.',
        },
        {
          time: '00:01.210',
          level: 'METRIC',
          message: 'ScaNN vector search latency: 3.4ms across 10 million embedding vectors.',
        },
        {
          time: '00:01.850',
          level: 'INFO',
          message: 'Stage 2: Deep transformer ranking (DLRM) evaluated on Triton Inference Server.',
        },
        {
          time: '00:02.620',
          level: 'METRIC',
          message: 'Current load: 75,420 queries per second sustained.',
        },
        {
          time: '00:03.110',
          level: 'SUCCESS',
          message: 'Load test complete. p99 response time: 16.4ms. Point-in-time skew: 0.00%.',
        },
      ],
      architecture: {
        summary:
          'Stateful streaming feature ingestion coupled with dual-stage vector retrieval and transformer ranking for low-latency recommendation.',
        nodes: [
          {
            name: 'Event Streaming Backbone',
            role: 'Real-time telemetry ingestion',
            tech: 'Apache Kafka',
          },
          {
            name: 'Stream Processor',
            role: 'Stateful aggregation & feature calculation',
            tech: 'Apache Flink',
          },
          {
            name: 'Online Feature Store',
            role: 'Sub-millisecond feature serving',
            tech: 'Feast + Redis Cluster',
          },
          {
            name: 'Dual-Stage Model Mesh',
            role: 'ScaNN retrieval + Triton DLRM ranking',
            tech: 'Triton Server + ScaNN',
          },
        ],
        pipeline: [
          'High-Velocity User Interaction Ingestion (Kafka)',
          'Sliding-Window Feature Computation (Flink)',
          'Real-Time Ingestion into Low-Latency Online Store (Feast)',
          'ScaNN Approximate Nearest Neighbor Candidate Retrieval',
          'Deep Transformer Ranking & Business Rule Deduplication',
        ],
        benchmarks: [
          { label: 'Query Throughput Capacity', value: '75,420 QPS', delta: 'Zero Throttling' },
          { label: 'Feature Update Freshness', value: '112ms', delta: 'True Real-Time' },
          { label: 'p99 End-to-End Latency', value: '16.4ms', delta: 'Sub-20ms SLA Met' },
        ],
      },
    },
  },
];
