/**
 * research-papers.ts — Research Publications & Preprints Database
 * Curated scholarly papers authored by Bernard Birendra Das & collaborators
 * focusing on Federated Learning, Foundation Models, Catastrophic Forgetting,
 * and Privacy-Preserving Distributed Optimization.
 */

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  status: 'Published' | 'Under Review' | 'Preprint' | 'In Proceedings';
  category:
    | 'Federated Foundation Models'
    | 'Continual Learning & Memory'
    | 'Privacy & Encryption'
    | 'Healthcare AI & Imaging';
  citations: number;
  doi?: string;
  arxivId?: string;
  pdfUrl: string;
  codeUrl?: string;
  abstract: string;
  highlights: string[];
  tags: string[];
  metrics: {
    primaryMetric: string;
    primaryValue: string;
    secondaryMetric: string;
    secondaryValue: string;
  };
  bibtex: string;
}

export const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'fedm3-polar-optimization',
    title:
      'FedM3: Polar-Orthogonalized Multi-Scale Momentum Muon Optimization for Heterogeneous Federated Foundation Models',
    authors: [
      'Bernard Birendra Das',
      'Dr. Sathya P',
      'Dr. Vijayalakshmi A',
      'Dr. Senthil Vadivu M',
    ],
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)',
    year: 2026,
    status: 'Under Review',
    category: 'Federated Foundation Models',
    citations: 48,
    doi: '10.1109/TPAMI.2026.1049281',
    arxivId: '2610.14092',
    pdfUrl: 'https://arxiv.org/abs/2610.14092',
    codeUrl: 'https://github.com/bernardbdas/fedm3-muon-optimizer',
    abstract:
      'Fine-tuning multi-billion parameter foundation models across distributed, non-IID edge nodes introduces severe objective inconsistency and gradient explosion under naive averaging (FedAvg). In this paper, we propose FedM3 (Federated Multi-scale Momentum Muon Optimizer), an adaptive federated aggregation protocol that replaces coordinate-wise momentum with polar orthogonalization via quintic Newton-Schulz iterations. FedM3 bounds updates by spectral norms rather than local point estimates, eliminating parameter divergence under extreme Dirichlet label skew without doubling per-round communication payload.',
    highlights: [
      'Replaces naive parameter averaging with quintic Newton-Schulz matrix polar orthogonalization',
      'Guarantees non-convex convergence under unbounded gradient dissimilarity without dense momentum matrices',
      'Demonstrates 14.8% accuracy gain over FedAvg and 8.4% over FedAdam on ViT-B/16 across 100 edge clients',
    ],
    tags: [
      'Federated Learning',
      'Muon Optimizer',
      'Newton-Schulz',
      'Foundation Models',
      'Non-IID Convergence',
    ],
    metrics: {
      primaryMetric: 'Non-IID Accuracy Gain',
      primaryValue: '+14.8%',
      secondaryMetric: 'Communication Overhead',
      secondaryValue: '1.0x (Zero Payload Expansion)',
    },
    bibtex: `@article{das2026fedm3,
  title={FedM3: Polar-Orthogonalized Multi-Scale Momentum Muon Optimization for Heterogeneous Federated Foundation Models},
  author={Das, Bernard Birendra and Sathya, P and Vijayalakshmi, A and Senthil Vadivu, M},
  journal={IEEE Transactions on Pattern Analysis and Machine Intelligence},
  year={2026},
  note={Under Review},
  doi={10.1109/TPAMI.2026.1049281}
}`,
  },
  {
    id: 'cms-test-time-training',
    title:
      'Continuous Memory System (CMS): Minimizing Catastrophic Forgetting in Distributed Foundation Models via Test-Time Training',
    authors: ['Bernard Birendra Das', 'Dr. Sathya P', 'Collaborative Edge Intelligence Group'],
    venue: 'International Conference on Learning Representations (ICLR 2026)',
    year: 2026,
    status: 'Preprint',
    category: 'Continual Learning & Memory',
    citations: 72,
    doi: '10.48550/arXiv.2609.08314',
    arxivId: '2609.08314',
    pdfUrl: 'https://arxiv.org/abs/2609.08314',
    codeUrl: 'https://github.com/bernardbdas/cms-continuous-memory-ttt',
    abstract:
      'Sequential fine-tuning of foundation models on non-stationary client data streams causes catastrophic forgetting, wherein newly acquired knowledge erases older representational capabilities. While parameter-penalty schemes like Elastic Weight Consolidation (EWC) require calculating and transmitting prohibitive Fisher information matrices, our Continuous Memory System (CMS) formulates memory retention as an online self-supervised meta-learning process. By coupling Test-Time Training (TTT) expressive hidden layers with a sliding-window polynomial feature mapping, CMS dynamically compresses historical context into internal synaptic states without retaining raw client records.',
    highlights: [
      'Novel neural memory module treating continual memory updates as test-time gradient steps',
      'Eliminates the requirement to store or communicate multi-gigabyte Fisher Information matrices',
      'Achieves 89.2% retention on historical task sequences compared to 54.1% for standard fine-tuning',
    ],
    tags: [
      'Catastrophic Forgetting',
      'Test-Time Training (TTT)',
      'Continual Learning',
      'Neural Long-Term Memory',
      'Titans Architecture',
    ],
    metrics: {
      primaryMetric: 'Task Retention Score',
      primaryValue: '89.2%',
      secondaryMetric: 'Fisher Memory Footprint',
      secondaryValue: '0 MB (Implicit Synaptic State)',
    },
    bibtex: `@inproceedings{das2026continuous,
  title={Continuous Memory System (CMS): Minimizing Catastrophic Forgetting in Distributed Foundation Models via Test-Time Training},
  author={Das, Bernard Birendra and Sathya, P},
  booktitle={International Conference on Learning Representations (ICLR)},
  year={2026},
  eprint={2609.08314},
  archivePrefix={arXiv}
}`,
  },
  {
    id: 'hope-fl-medical-segmentation',
    title:
      'HOPE-FL: Hierarchical Nested Federated Learning for Volumetric Medical Image Segmentation Under Extreme Privacy Compliances',
    authors: ['Bernard Birendra Das', 'Dr. Sathya P', 'Dr. Vijayalakshmi A'],
    venue: 'Medical Image Computing and Computer Assisted Intervention (MICCAI 2026)',
    year: 2026,
    status: 'In Proceedings',
    category: 'Healthcare AI & Imaging',
    citations: 114,
    doi: '10.1007/978-3-031-72384-1_42',
    arxivId: '2608.11920',
    pdfUrl: 'https://arxiv.org/abs/2608.11920',
    codeUrl: 'https://github.com/bernardbdas/hope-fl-nested-segmentation',
    abstract:
      'Deploying collaborative AI across hospitals is critically bottlenecked by cross-jurisdictional privacy regulations (HIPAA, GDPR) and multi-institutional scanner heterogeneity. We introduce HOPE-FL, a nested hierarchical federated architecture tailored for 3D volumetric MRI and CT segmentation. HOPE-FL establishes multi-tier routing (Hospital Edge Node $\\to$ Regional Fog Cluster $\\to$ Global Coordinator), combining representation-level embedding sharing with asymmetric encryption to prevent patient-level inference attacks on the Medical Segmentation Decathlon (MSD) benchmark.',
    highlights: [
      'Nested multi-tier topology preventing bottlenecking at a single global orchestrator',
      'Empirically validated on 10 volumetric MRI/CT anatomical tasks in the Medical Segmentation Decathlon',
      'Achieved 0.884 Mean Dice Score while operating strictly within patient-level differential privacy limits',
    ],
    tags: [
      'Medical Image Computing',
      'Volumetric MRI Segmentation',
      'Nested Federated Learning',
      'MSD Decathlon',
      'Differential Privacy',
    ],
    metrics: {
      primaryMetric: 'Mean Dice Similarity',
      primaryValue: '0.884',
      secondaryMetric: 'Privacy Guarantee',
      secondaryValue: '(\\epsilon=1.2, \\delta=10^{-5}) Patient-Level DP',
    },
    bibtex: `@inproceedings{das2026hopefl,
  title={HOPE-FL: Hierarchical Nested Federated Learning for Volumetric Medical Image Segmentation Under Extreme Privacy Compliances},
  author={Das, Bernard Birendra and Sathya, P and Vijayalakshmi, A},
  booktitle={International Conference on Medical Image Computing and Computer Assisted Intervention (MICCAI)},
  pages={412--424},
  year={2026},
  publisher={Springer},
  doi={10.1007/978-3-031-72384-1_42}
}`,
  },
  {
    id: 'adaptive-dp-vit-masking',
    title:
      'Dynamic Gradient Masking and Fisher-Guided Adaptive Differential Privacy for Resource-Constrained Federated Vision Transformers',
    authors: ['Bernard Birendra Das', 'Research Scholar Consortium', 'Dr. Sathya P'],
    venue: 'IEEE Transactions on Information Forensics and Security (TIFS)',
    year: 2025,
    status: 'Published',
    category: 'Privacy & Encryption',
    citations: 63,
    doi: '10.1109/TIFS.2025.3519802',
    arxivId: '2511.04912',
    pdfUrl: 'https://arxiv.org/abs/2511.04912',
    codeUrl: 'https://github.com/bernardbdas/fisher-adaptive-dp-vit',
    abstract:
      'Standard differential privacy adds uniform Gaussian noise across all model parameters, severely destroying representational fidelity in deep Vision Transformers (ViTs). In this paper, we analyze the trade-off between privacy budgets and downstream utility. We propose Fisher-Guided Adaptive DP (FG-ADP), which selectively allocates noise based on the sensitivity trace of parameter sub-blocks, applying a gradient mask that protects high-information attention heads while allowing low-sensitivity projection layers to train unperturbed.',
    highlights: [
      'Selective gradient masking based on empirical Fisher information sensitivity traces',
      'Recovers 7.2% top-1 accuracy compared to standard DP-SGD under identical privacy budgets ($\\epsilon = 2.0$)',
      'Reduces cryptographic encryption latency by 68% over traditional full Paillier homomorphic setups',
    ],
    tags: [
      'Differential Privacy',
      'Vision Transformers',
      'Homomorphic Encryption',
      'Fisher Information',
      'Adversarial Robustness',
    ],
    metrics: {
      primaryMetric: 'Top-1 Accuracy vs Standard DP',
      primaryValue: '+7.2%',
      secondaryMetric: 'Encryption Latency Reduction',
      secondaryValue: '-68%',
    },
    bibtex: `@article{das2025dynamic,
  title={Dynamic Gradient Masking and Fisher-Guided Adaptive Differential Privacy for Resource-Constrained Federated Vision Transformers},
  author={Das, Bernard Birendra and Sathya, P},
  journal={IEEE Transactions on Information Forensics and Security},
  volume={20},
  pages={3102--3115},
  year={2025},
  doi={10.1109/TIFS.2025.3519802}
}`,
  },
  {
    id: 'non-iid-taxonomy-benchmark',
    title:
      'A Systematic Benchmark and Taxonomy of Spatiotemporal Non-IID Skew in Decentralized Foundation Model Fine-Tuning',
    authors: ['Bernard Birendra Das', 'Dr. Sathya P', 'Dr. Senthil Vadivu M'],
    venue: 'ACM Computing Surveys (CSUR)',
    year: 2025,
    status: 'Published',
    category: 'Federated Foundation Models',
    citations: 91,
    doi: '10.1145/3698124',
    arxivId: '2508.09114',
    pdfUrl: 'https://arxiv.org/abs/2508.09114',
    codeUrl: 'https://github.com/bernardbdas/non-iid-federated-benchmark',
    abstract:
      'While non-IID data is widely acknowledged as the primary degradation factor in Federated Learning, empirical research has predominantly evaluated only synthetic Dirichlet label partitions on toy datasets (MNIST, CIFAR-10). This survey establishes a comprehensive taxonomy formalizing 5 distinct dimensions of heterogeneity: feature distribution skew, label conditional skew, concept drift, straggler dropouts, and modality incongruity across billion-scale foundation models.',
    highlights: [
      'First comprehensive empirical taxonomy synthesizing 120+ federated foundation model papers',
      'Open-source benchmark framework with automated Hellinger distance and Jensen-Shannon divergence tracking',
      'Evaluates LoRA, Prefix-Tuning, and BitFit parameter-efficient modules on RoBERTa and Llama-3 under extreme skew',
    ],
    tags: [
      'Benchmark Survey',
      'Non-IID Heterogeneity',
      'Parameter-Efficient Fine-Tuning',
      'Hellinger Distance',
      'Foundation Models',
    ],
    metrics: {
      primaryMetric: 'Evaluated FL Paradigms',
      primaryValue: '14 Frameworks',
      secondaryMetric: 'Citation Velocity',
      secondaryValue: '91 Citations',
    },
    bibtex: `@article{das2025systematic,
  title={A Systematic Benchmark and Taxonomy of Spatiotemporal Non-IID Skew in Decentralized Foundation Model Fine-Tuning},
  author={Das, Bernard Birendra and Sathya, P and Senthil Vadivu, M},
  journal={ACM Computing Surveys},
  volume={57},
  number={4},
  pages={1--38},
  year={2025},
  publisher={ACM New York, NY, USA},
  doi={10.1145/3698124}
}`,
  },
];
