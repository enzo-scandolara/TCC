const Service = require('../models/Service');

// CRIAR SERVIÇO (somente admin)
const createService = async (req, res) => {
  try {
    const { nome, descricao, duracao, preco, categoria } = req.body;

    // Verificar se serviço com mesmo nome já existe
    const serviceExists = await Service.findOne({ nome });
    if (serviceExists) {
      return res.status(400).json({ mensagem: 'Serviço com este nome já existe' });
    }

    const service = new Service({
      nome,
      descricao,
      duracao,
      preco,
      categoria
    });

    await service.save();

    res.status(201).json({
      mensagem: 'Serviço criado com sucesso',
      service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// LISTAR TODOS OS SERVIÇOS (público)
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ ativo: true }).sort({ nome: 1 });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// LISTAR SERVIÇO POR ID (público)
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ mensagem: 'Serviço não encontrado' });
    }

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// ATUALIZAR SERVIÇO (somente admin)
const updateService = async (req, res) => {
  try {
    const { nome, descricao, duracao, preco, categoria, ativo } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { nome, descricao, duracao, preco, categoria, ativo },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ mensagem: 'Serviço não encontrado' });
    }

    res.json({
      mensagem: 'Serviço atualizado com sucesso',
      service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

// "DELETAR" SERVIÇO (marcar como inativo - somente admin)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ mensagem: 'Serviço não encontrado' });
    }

    res.json({ mensagem: 'Serviço desativado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: 'Erro no servidor' });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
};