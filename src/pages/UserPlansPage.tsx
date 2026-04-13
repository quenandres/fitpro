import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, ChevronLeft, Plus, Trash2, X,
  Dumbbell, Calendar, ChevronRight
} from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import type { Usuario, Rutina, EjercicioPersonalizado, SemanaPlan } from '../types';
import usuariosData from '../data/usuarios.json';

const DIAS_SEMANA = [
  { dia: 1, nombre: 'Lunes', nombreCorto: 'Lun' },
  { dia: 2, nombre: 'Martes', nombreCorto: 'Mar' },
  { dia: 3, nombre: 'Miércoles', nombreCorto: 'Mié' },
  { dia: 4, nombre: 'Jueves', nombreCorto: 'Jue' },
  { dia: 5, nombre: 'Viernes', nombreCorto: 'Vie' },
  { dia: 6, nombre: 'Sábado', nombreCorto: 'Sáb' },
  { dia: 0, nombre: 'Domingo', nombreCorto: 'Dom' },
];

type VistaScreen = 'lista' | 'dias' | 'dia-editar';

const UserPlansPage = () => {
  const { rutinas, ejercicios } = useDataStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosData as Usuario[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [currentView, setCurrentView] = useState<VistaScreen>('lista');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [creatingUser, setCreatingUser] = useState<Partial<Usuario>>({
    nombre: '', email: '', objetivo: '', nivel: 'Principiante', dias_entrenar: 3
  });
  const [creatingPlan, setCreatingPlan] = useState({
    nombre: '', descripcion: '', semanas: 4, dias_entrenar_semana: 3
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDia, setEditingDia] = useState<{semana: number; diaIndex: number} | null>(null);
  const [showRutinaPicker, setShowRutinaPicker] = useState(false);
  const [showEjercicioPicker, setShowEjercicioPicker] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return usuarios;
    const term = searchTerm.toLowerCase();
    return usuarios.filter(u => 
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.objetivo.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const getRutinaById = (id: number): Rutina | undefined => {
    return rutinas.find(r => r.id === id);
  };

  const currentUserPlan = selectedUser?.plan;
  const currentSemana = currentUserPlan?.programacion_semanal.find(s => s.semana === selectedWeek);

  const handleCreateUser = () => {
    if (!creatingUser.nombre || !creatingPlan.nombre) return;

    const newUserId = Math.max(...usuarios.map(u => u.id), 0) + 1;
    const emptyWeek: SemanaPlan = {
      semana: 1,
      dias: DIAS_SEMANA.map(d => ({
        ...d,
        rutina_id: null,
        rutina_nombre: '',
        ejercicios_personalizados: []
      })),
      notas: ''
    };

    const newUser: Usuario = {
      id: newUserId,
      nombre: creatingUser.nombre || '',
      email: creatingUser.email || '',
      objetivo: creatingUser.objetivo || '',
      nivel: creatingUser.nivel || 'Principiante',
      dias_entrenar: creatingUser.dias_entrenar || 3,
      plan: {
        id: newUserId,
        nombre: creatingPlan.nombre,
        descripcion: creatingPlan.descripcion,
        semanas: creatingPlan.semanas,
        dias_entrenar_semana: creatingPlan.dias_entrenar_semana,
        rutinas_asignadas: [],
        ejercicios_personalizados: [],
        programacion_semanal: Array.from({ length: creatingPlan.semanas }, (_, i) => ({
          ...emptyWeek,
          semana: i + 1
        }))
      }
    };

    setUsuarios([...usuarios, newUser]);
    setShowCreateForm(false);
    setCreatingUser({ nombre: '', email: '', objetivo: '', nivel: 'Principiante', dias_entrenar: 3 });
    setCreatingPlan({ nombre: '', descripcion: '', semanas: 4, dias_entrenar_semana: 3 });
    setSelectedUser(newUser);
    setCurrentView('dias');
  };

  const handleToggleDiaEntreno = (semanaNum: number, diaIndex: number) => {
    if (!selectedUser) return;
    
    const currentSemana = selectedUser.plan.programacion_semanal.find(s => s.semana === semanaNum);
    const currentDia = currentSemana?.dias[diaIndex];
    const isEntreno = currentDia?.rutina_id !== null && currentDia?.rutina_id !== -1;

    const updatedUser: Usuario = {
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map(semana => 
          semana.semana === semanaNum
            ? {
                ...semana,
                dias: semana.dias.map((dia, dIdx) => 
                  dIdx === diaIndex 
                    ? isEntreno 
                      ? { ...dia, rutina_id: -1, rutina_nombre: 'Nueva Rutina', ejercicios_personalizados: [] }
                      : { ...dia, rutina_id: 0, rutina_nombre: 'Entrenamiento', ejercicios_personalizados: [] }
                    : dia
                )
              }
            : semana
        )
      }
    };

    setUsuarios(usuarios.map(u => u.id === selectedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  const handleSelectRutinaForDia = (semanaNum: number, diaIndex: number, rutinaId: number) => {
    if (!selectedUser) return;
    
    const rutina = getRutinaById(rutinaId);
    
    const updatedUser: Usuario = {
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map(semana => 
          semana.semana === semanaNum
            ? {
                ...semana,
                dias: semana.dias.map((dia, dIdx) => 
                  dIdx === diaIndex 
                    ? { 
                        ...dia, 
                        rutina_id: rutinaId, 
                        rutina_nombre: rutina?.nombre || '',
                        ejercicios_personalizados: rutina?.ejercicios.map(e => ({
                          nombre: e.nombre,
                          series: e.series,
                          reps: e.valor,
                          notas: ''
                        })) || []
                      }
                    : dia
                )
              }
            : semana
        )
      }
    };

    setUsuarios(usuarios.map(u => u.id === selectedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  const handleAddEjercicioToDia = (semanaNum: number, diaIndex: number, ejercicio: EjercicioPersonalizado) => {
    if (!selectedUser) return;

    const updatedUser: Usuario = {
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map(semana => 
          semana.semana === semanaNum
            ? {
                ...semana,
                dias: semana.dias.map((dia, dIdx) => 
                  dIdx === diaIndex 
                    ? { 
                        ...dia, 
                        ejercicios_personalizados: [...dia.ejercicios_personalizados, ejercicio]
                      }
                    : dia
                )
              }
            : semana
        )
      }
    };

    setUsuarios(usuarios.map(u => u.id === selectedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  const handleRemoveEjercicioFromDia = (semanaNum: number, diaIndex: number, ejercicioIndex: number) => {
    if (!selectedUser) return;

    const updatedUser: Usuario = {
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map(semana => 
          semana.semana === semanaNum
            ? {
                ...semana,
                dias: semana.dias.map((dia, dIdx) => 
                  dIdx === diaIndex 
                    ? { 
                        ...dia, 
                        ejercicios_personalizados: dia.ejercicios_personalizados.filter((_, i) => i !== ejercicioIndex)
                      }
                    : dia
                )
              }
            : semana
        )
      }
    };

    setUsuarios(usuarios.map(u => u.id === selectedUser.id ? updatedUser : u));
    if (selectedUser?.id === selectedUser.id) setSelectedUser(updatedUser);
  };

  const handleUpdateEjercicioInDia = (semanaNum: number, diaIndex: number, ejercicioIndex: number, updates: Partial<EjercicioPersonalizado>) => {
    if (!selectedUser) return;

    const updatedUser: Usuario = {
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map(semana => 
          semana.semana === semanaNum
            ? {
                ...semana,
                dias: semana.dias.map((dia, dIdx) => 
                  dIdx === diaIndex 
                    ? { 
                        ...dia, 
                        ejercicios_personalizados: dia.ejercicios_personalizados.map((e, i) => 
                          i === ejercicioIndex ? { ...e, ...updates } : e
                        )
                      }
                    : dia
                )
              }
            : semana
        )
      }
    };

    setUsuarios(usuarios.map(u => u.id === selectedUser.id ? updatedUser : u));
    setSelectedUser(updatedUser);
  };

  const openDiaEditor = (semana: number, diaIndex: number) => {
    setEditingDia({ semana, diaIndex });
    setCurrentView('dia-editar');
  };

  const renderVistaLista = () => (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
      <div className="fp-card" style={{ padding: 14, marginBottom: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderRadius: 13 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input 
            className="fp-input" 
            style={{ paddingLeft: 32 }} 
            placeholder="Buscar usuarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="fp-btn fp-btn-primary"
          style={{ gap: 6, fontSize: 12 }}
        >
          <Plus size={14} /> Nuevo Plan
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filteredUsers.map(user => (
          <div 
            key={user.id}
            className="fp-card"
            onClick={() => { setSelectedUser(user); setCurrentView('dias'); }}
            style={{ padding: 16, borderRadius: 13, cursor: 'pointer', border: selectedUser?.id === user.id ? '2px solid #a371f7' : '2px solid transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#a371f7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{user.nombre.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{user.nombre}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#22c55e20', color: '#22c55e' }}>{user.objetivo}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#58a6ff20', color: '#58a6ff' }}>{user.nivel}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#f0883e20', color: '#f0883e' }}>{user.plan.semanas} sem</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-app)', zIndex: 100,
          overflow: 'auto', padding: 20
        }}>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Crear Nuevo Plan</h2>
              <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nombre del Usuario</p>
              <input className="fp-input" placeholder="Juan Pérez" value={creatingUser.nombre} onChange={(e) => setCreatingUser({ ...creatingUser, nombre: e.target.value })} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</p>
              <input className="fp-input" placeholder="juan@email.com" value={creatingUser.email} onChange={(e) => setCreatingUser({ ...creatingUser, email: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Objetivo</p>
                <input className="fp-input" placeholder="Ganar músculo" value={creatingUser.objetivo} onChange={(e) => setCreatingUser({ ...creatingUser, objetivo: e.target.value })} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Nivel</p>
                <select className="fp-input" value={creatingUser.nivel} onChange={(e) => setCreatingUser({ ...creatingUser, nivel: e.target.value })}>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-overlay)', marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#a371f7', marginBottom: 12 }}>Configuración del Plan</p>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Nombre del Plan</p>
                <input className="fp-input" placeholder="Plan Fuerza" value={creatingPlan.nombre} onChange={(e) => setCreatingPlan({ ...creatingPlan, nombre: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Semanas</p>
                  <input type="number" className="fp-input" min={1} max={52} value={creatingPlan.semanas} onChange={(e) => setCreatingPlan({ ...creatingPlan, semanas: parseInt(e.target.value) || 4 })} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Días/semana</p>
                  <select className="fp-input" value={creatingPlan.dias_entrenar_semana} onChange={(e) => setCreatingPlan({ ...creatingPlan, dias_entrenar_semana: parseInt(e.target.value) })}>
                    {[1,2,3,4,5,6,7].map(d => <option key={d} value={d}>{d} días</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleCreateUser} className="fp-btn fp-btn-primary" style={{ width: '100%', gap: 6 }} disabled={!creatingUser.nombre || !creatingPlan.nombre}>
              <Plus size={14} /> Crear Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderVistaDias = () => {
    if (!selectedUser || !currentSemana) return null;

    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px', paddingBottom: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setCurrentView('lista')} className="fp-btn fp-btn-ghost" style={{ padding: 8 }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUser.nombre}</h2>
            <p style={{ fontSize: 12, color: '#a371f7' }}>{selectedUser.plan.nombre}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          <div style={{ padding: 10, borderRadius: 8, background: '#22c55e15' }}>
            <p style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>OBJETIVO</p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.objetivo}</p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: '#58a6ff15' }}>
            <p style={{ fontSize: 9, color: '#58a6ff', fontWeight: 600 }}>NIVEL</p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.nivel}</p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: '#f0883e15' }}>
            <p style={{ fontSize: 9, color: '#f0883e', fontWeight: 600 }}>DÍAS/SEM</p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.plan.dias_entrenar_semana}</p>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: '#a371f715' }}>
            <p style={{ fontSize: 9, color: '#a371f7', fontWeight: 600 }}>DURACIÓN</p>
            <p style={{ fontSize: 11, fontWeight: 600 }}>{selectedUser.plan.semanas} sem</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))} disabled={selectedWeek === 1} className="fp-btn fp-btn-ghost" style={{ padding: 6 }}><ChevronLeft size={16} /></button>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 100, textAlign: 'center' }}>Semana {selectedWeek}</span>
            <button onClick={() => setSelectedWeek(Math.min(selectedUser.plan.semanas, selectedWeek + 1))} disabled={selectedWeek === selectedUser.plan.semanas} className="fp-btn fp-btn-ghost" style={{ padding: 6 }}><ChevronRight size={16} /></button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {selectedUser.plan.programacion_semanal.map(s => (
              <button key={s.semana} onClick={() => setSelectedWeek(s.semana)} style={{ width: 28, height: 28, borderRadius: 6, border: selectedWeek === s.semana ? '2px solid #a371f7' : '1px solid var(--border)', background: selectedWeek === s.semana ? '#a371f720' : 'transparent', fontSize: 11, fontWeight: 600, color: selectedWeek === s.semana ? '#a371f7' : 'var(--text-muted)', cursor: 'pointer' }}>{s.semana}</button>
            ))}
          </div>
        </div>

        {(() => {
          const diasEntreno = currentSemana.dias.filter(d => d.rutina_id !== null && d.rutina_id !== -1 && d.rutina_id !== 0 && d.ejercicios_personalizados.length > 0);
          const diasDescanso = currentSemana.dias.filter(d => !d.rutina_id || d.rutina_id === -1 || d.rutina_id === 0 || d.ejercicios_personalizados.length === 0);
          const tiempoEntreno = diasEntreno.reduce((acc, d) => {
            const tiempo = d.ejercicios_personalizados.reduce((sum, e) => {
              const serieMin = 0.5;
              return sum + (e.series * serieMin);
            }, 0);
            return acc + Math.max(tiempo, 20);
          }, 0);
          
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 12, borderRadius: 10, background: '#22c55e15', border: '1px solid #22c55e30' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>ENTRENAMIENTO</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{Math.round(tiempoEntreno)} min</p>
                <p style={{ fontSize: 10, color: '#22c55e80' }}>{diasEntreno.length} días activos</p>
              </div>
              <div style={{ padding: 12, borderRadius: 10, background: '#58a6ff15', border: '1px solid #58a6ff30' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#58a6ff', marginBottom: 4 }}>DESCANSO</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#58a6ff' }}>{diasDescanso.length} días</p>
                <p style={{ fontSize: 10, color: '#58a6ff80' }}>{diasDescanso.length * 24 * 60} min recuperación</p>
              </div>
            </div>
          );
        })()}

        <div style={{ display: 'grid', gap: 8 }}>
          {currentSemana.dias.map((dia, diaIndex) => {
            const isEntreno = dia.rutina_id !== null && dia.rutina_id !== -1 && dia.rutina_id !== 0;
            const isNueva = dia.rutina_id === -1 || dia.rutina_id === 0;
            const tieneEjercicios = dia.ejercicios_personalizados && dia.ejercicios_personalizados.length > 0;
            
            return (
              <div 
                key={diaIndex}
                onClick={() => openDiaEditor(selectedWeek, diaIndex)}
                style={{ 
                  padding: 16, 
                  borderRadius: 12, 
                  background: isEntreno || isNueva ? '#22c55e10' : 'var(--bg-overlay)',
                  border: isEntreno || isNueva ? '1px solid #22c55e40' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: isEntreno || isNueva ? '#22c55e30' : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isEntreno ? <Dumbbell size={18} color="#22c55e" /> : <Calendar size={18} color="var(--text-muted)" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{dia.nombre}</p>
                      <p style={{ fontSize: 11, color: isEntreno ? '#22c55e' : 'var(--text-muted)' }}>
                        {isEntreno ? dia.rutina_nombre : isNueva ? 'Nueva Rutina' : 'Descanso'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {tieneEjercicios && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#22c55e20', color: '#22c55e' }}>
                        {dia.ejercicios_personalizados.length} ejer
                      </span>
                    )}
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
                
                {tieneEjercicios && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {dia.ejercicios_personalizados.slice(0, 4).map((ej, i) => (
                        <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                          {ej.nombre}
                        </span>
                      ))}
                      {dia.ejercicios_personalizados.length > 4 && (
                        <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                          +{dia.ejercicios_personalizados.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVistaDiaEditar = () => {
    if (!selectedUser || !editingDia) return null;
    
    const semana = selectedUser.plan.programacion_semanal.find(s => s.semana === editingDia.semana);
    const dia = semana?.dias[editingDia.diaIndex];
    if (!dia) return null;

    const handleToggleEntreno = () => {
      handleToggleDiaEntreno(editingDia.semana, editingDia.diaIndex);
    };

    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px', paddingBottom: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setCurrentView('dias')} className="fp-btn fp-btn-ghost" style={{ padding: 8 }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{dia.nombre} - Semana {editingDia.semana}</h2>
            <p style={{ fontSize: 12, color: '#a371f7' }}>{selectedUser.nombre}</p>
          </div>
          <button onClick={handleToggleEntreno} className="fp-btn" style={{ background: dia.rutina_id ? '#f8514920' : '#22c55e20', color: dia.rutina_id ? '#f85149' : '#22c55e', border: 'none', fontSize: 12 }}>
            {dia.rutina_id ? 'Descanso' : 'Activar'}
          </button>
        </div>

        {(!dia.rutina_id || dia.rutina_id === -1 || dia.rutina_id === 0) && dia.ejercicios_personalizados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Calendar size={28} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Día sin configurar</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Selecciona una rutina o agrega ejercicios</p>
            <button onClick={handleToggleEntreno} className="fp-btn fp-btn-primary" style={{ gap: 6, marginBottom: 12 }}>
              <Plus size={14} /> Activar entrenamiento
            </button>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>O añade ejercicios directamente</p>
              <div style={{ display: 'grid', gap: 6, maxHeight: 200, overflow: 'auto', textAlign: 'left' }}>
                {ejercicios.slice(0, 10).map(ej => (
                  <button key={ej.id} onClick={() => { handleAddEjercicioToDia(editingDia.semana, editingDia.diaIndex, { nombre: ej.nombre, series: 3, reps: 12 }); }} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{ej.nombre}</span>
                    <Plus size={14} color="#22c55e" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ padding: 16, borderRadius: 12, background: '#a371f715', border: '1px solid #a371f740', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{dia.rutina_nombre}</p>
                <button onClick={() => setShowRutinaPicker(true)} style={{ background: 'none', border: 'none', color: '#58a6ff', fontSize: 12, cursor: 'pointer' }}>Cambiar</button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dia.ejercicios_personalizados.length} ejercicios configurados</p>
            </div>

            {showRutinaPicker && (
              <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Seleccionar rutina base</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {rutinas.map(r => (
                    <button key={r.id} onClick={() => { handleSelectRutinaForDia(editingDia.semana, editingDia.diaIndex, r.id); setShowRutinaPicker(false); }} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'left', cursor: 'pointer' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.nombre}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.dificultad} · {r.duracion_min} min · {r.ejercicios.length} ejer</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowRutinaPicker(false)} style={{ marginTop: 12, width: '100%', padding: 10, background: 'var(--bg-card)', border: 'none', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ejercicios</p>
              <button onClick={() => setShowEjercicioPicker(!showEjercicioPicker)} className="fp-btn fp-btn-primary" style={{ gap: 4, fontSize: 11, padding: '6px 12px' }}>
                <Plus size={12} /> Añadir
              </button>
            </div>

            {showEjercicioPicker && (
              <div style={{ marginBottom: 16, padding: 16, borderRadius: 12, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>Añadir ejercicio de la biblioteca</p>
                <div style={{ display: 'grid', gap: 6, maxHeight: 200, overflow: 'auto' }}>
                  {ejercicios.map(ej => (
                    <button key={ej.id} onClick={() => { handleAddEjercicioToDia(editingDia.semana, editingDia.diaIndex, { nombre: ej.nombre, series: 3, reps: ej.unidad_id_default === 1 ? 12 : 10 }); setShowEjercicioPicker(false); }} style={{ padding: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{ej.nombre}</span>
                      <Plus size={14} color="#22c55e" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowEjercicioPicker(false)} style={{ marginTop: 12, width: '100%', padding: 10, background: 'var(--bg-card)', border: 'none', borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dia.ejercicios_personalizados.map((ej, ejIndex) => (
                <div key={ejIndex} style={{ padding: 14, borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{ej.nombre}</p>
                    <button onClick={() => handleRemoveEjercicioFromDia(editingDia.semana, editingDia.diaIndex, ejIndex)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={14} color="#f85149" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Series</p>
                      <input 
                        type="number" 
                        className="fp-input" 
                        value={ej.series} 
                        onChange={(e) => handleUpdateEjercicioInDia(editingDia.semana, editingDia.diaIndex, ejIndex, { series: parseInt(e.target.value) || 1 })}
                        min={1}
                        style={{ padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Reps</p>
                      <input 
                        type="number" 
                        className="fp-input" 
                        value={ej.reps} 
                        onChange={(e) => handleUpdateEjercicioInDia(editingDia.semana, editingDia.diaIndex, ejIndex, { reps: parseInt(e.target.value) || 1 })}
                        min={1}
                        style={{ padding: '8px 10px', fontSize: 13 }}
                      />
                    </div>
                  </div>
                  {ej.notas && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>{ej.notas}</p>}
                </div>
              ))}

              {dia.ejercicios_personalizados.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', background: 'var(--bg-overlay)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No hay ejercicios. Toca "Añadir" para agregar.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <header className="fp-glass sticky top-0 z-50">
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/admin" className="fp-btn fp-btn-ghost" style={{ padding: '7px 9px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
              <ChevronLeft size={16} />
            </Link>
            <div style={{ width: 1, height: 26, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#a371f7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={15} color="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Planes de Entrenamiento</p>
                <p style={{ fontSize: 10, color: '#a371f7', fontWeight: 600 }}>Gestión completa</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a371f7' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{usuarios.length}</span>
          </div>
        </div>
      </header>

      {currentView === 'lista' && renderVistaLista()}
      {currentView === 'dias' && renderVistaDias()}
      {currentView === 'dia-editar' && renderVistaDiaEditar()}
    </div>
  );
};

export { UserPlansPage };
