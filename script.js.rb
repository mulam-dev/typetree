require 'browser'

include Glimmer

Data = ['Root', ['Item'], ['Item']]

CmdMap = {
  confirm:        ['Enter'],
  insert_after:   ['Enter'],
  insert_before:  ['Shift+Enter'],
  insert_to:      ['Ctrl+Enter'],
  insert_into:    ['Insert'],
  insert_outof:   ['Shift+Insert'],
  delete:         ['Delete', 'Backspace'],
  leave:          ['Esc'],
  switch_next:    ['Tab'],
  switch_prev:    ['Shift+Tab'],
  up:             ['ArrowUp'],
  right:          ['ArrowRight'],
  down:           ['ArrowDown'],
  left:           ['ArrowLeft'],
  next:           ['ArrowDown', 'ArrowRight'],
  prev:           ['ArrowTop', 'ArrowLeft'],
  select_up:      ['Shift+ArrowUp'],
  select_right:   ['Shift+ArrowRight'],
  select_down:    ['Shift+ArrowDown'],
  select_left:    ['Shift+ArrowLeft'],
  select_next:    ['Shift+ArrowDown', 'Shift+ArrowRight'],
  select_prev:    ['Shift+ArrowTop', 'Shift+ArrowLeft'],
  move_up:        ['Ctrl+ArrowUp'],
  move_right:     ['Ctrl+ArrowRight'],
  move_down:      ['Ctrl+ArrowDown'],
  move_left:      ['Ctrl+ArrowLeft'],
  move_next:      ['Ctrl+ArrowDown', 'Ctrl+ArrowRight'],
  move_prev:      ['Ctrl+ArrowTop', 'Ctrl+ArrowLeft'],
}

class EventManager < Struct.new('EventManager', :shortcut_map)
  def sign_cmds(cmds)
    shortcut_map.merge! cmds.flat_map { |cmd| CmdMap[cmd].map { |shortcut| [shortcut, cmd] } } .to_h
  end
  def clone
    cp = super
    cp.shortcut_map = shortcut_map.dup
    cp
  end
  def parse(e)
    shortcut = "#{e.ctrl_key ? 'Ctrl+' : ''}#{e.shift_key ? 'Shift+' : ''}#{e[:code]}"
    shortcut_map[shortcut]
  end
end

class Action
  class << self
    attr_reader :id
    def make_map(*types)
      types.to_h { |value| [value.id, value] }
    end
  end
end

class NodeBase
  @event_manager = EventManager.new({})

  class << self
    attr_accessor :event_manager
    
    def inherited(subclass)
      super
      subclass.event_manager = self.event_manager.clone
    end
  
    def sign_cmds(cmds)
      @event_manager.sign_cmds(cmds)
    end
  end

  def initialize(data)
    @raw_data = format_data(data)
    set_data(data)
  end

  def is_valid_data?(data)
    true
  end

  def format_data(data)
    data
  end

  def set_data(data) end

  def view
    scope(div)
  end

  def scope(elem)
    Native(elem.get(0)).node = self
  end

  def bubble_shortcut(e, path)
  end

  def recv_shortcut(e, path = [])
    if cmd = self.class.event_manager.parse(e)
      e.kill
      self.on_cmd(cmd)
    else
      self.bubble_shortcut(e, path)
    end
  end
end

class NodeArray < NodeBase
  @action_types = Action.make_map(
    Class.new(Action) do
      @id = :insert
      def initialize(index)
        @index = index
      end
      def invert
        @action_types[:delete].new(@index)
      end
      def exec
      end
    end
  )

  def is_valid_data?(data)
    data.is_a?(Array)
  end

  attr_accessor :data_items

  def set_data(data)
    self.data_items = data
  end

  def index_node(node)
    # TODO
  end
end

class NodeList < NodeArray
  sign_cmds([
    :confirm,
    :insert_before,
    :insert_to,
    :insert_into,
    :insert_outof,
    :delete,
    :leave,
    :next,
    :prev,
    :select_next,
    :select_prev,
    :move_next,
    :move_prev,
  ])

  def format_data(data)
    if data.any? and ((head = data[0]).is_a?(String) or (head.is_a?(Hash) and head[:text].is_a?(String)))
      data
    else
      ['', *data]
    end
  end

  attr_accessor :data_head_text

  def set_data(data)
    self.data_head_text = (head = data[0]).is_a?(String) ? head : head[:text]
    super data.drop(1)
  end

  def view(store)
    root = nil
    scope(div(class: 'n t-elem') { |elem|
      ondblclick do |e|
        e.kill
        on_cmd(:confirm)
      end
      @v_head = store[:head] = div(class: 'n t-atom s-label f-primary') {
        inner_text <= [self, :data_head_text]
      }
      root = div(class: 'n t-layout s-bracket') {
        div(class: 'n t-layout s-box f-dir-vertical') {
          yield
        }
      }
    })
    root
  end

  def inner
    data_items.each do |n|
      node_view(node: n)
    end
  end

  def on_cmd(cmd)
    case cmd
    when :confirm
      inline_editor = Editor.ext_inline_editor
      if inline_editor.called
        puts 'hello'
      else
        rect = Editor.calc_rect(@v_head)
        inline_editor.connect do |content|
          self.data_head_text = content
        end
        inline_editor.call(rect[:x], rect[:y], content: data_head_text)
      end
    end
  end
end

class NodeView
  include Glimmer::Web::Component

  option :node
  option :inner
  option :store, default: {}

  markup {
    @root = node.view(store) { node.inner }
  }
end

class InlineEditor
  include Glimmer::Web::Component

  attr_reader :called

  @event_manager = EventManager.new({})

  @event_manager.sign_cmds([
    :confirm,
  ])

  def self.event_manager
    @event_manager
  end

  def content=(value)
    @content = value
    @callback.call(@content) if @callback
    after(0) { update_win_size }
  end

  def call(x, y, max_width: nil, content: '')
    v_root = @v_root.dom_element
    v_root.css '--x', "#{x}px"
    v_root.css '--y', "#{y}px"
    v_root.css '--w', "#{max_width}px"
    v_root.add_class 'f-show'
    @called = true
    self.content = content
    @v_input.focus
    $$.select(@v_input.get(0))
  end

  def connect(&callback)
    @callback = callback
  end

  def disconnect
    @callback = nil
  end

  markup {
    @v_root = div(class: 'ext-inline-editor') {
      @v_input = div(class: 'i-input', spellcheck: false, contenteditable: true) {
        inner_text <= [self, :content]
        onblur do
          @v_root.remove_class 'f-show'
          @called = nil
        end
        onkeydown do |e|
          if self.class.event_manager.parse(e)
            Editor.push_shortcut(e)
          end
        end
        oninput do
          self.content = @v_input.inner_text
        end
      }
    }
  }
end

class TypetreeEditor
  include Glimmer::Web::Component

  options :node, :cursor
  option :shrink, default: false

  attr_reader :active_elem, :anchor_elem, :focus_elem

  def active_elem=(elem)
    @v_cursor.get_animations[0]&.currentTime = 0
    if v_cursor = @v_cursor.dom_element
      if elem
        root_offset = @v_overlay.offset
        offset = elem.offset
        v_cursor.css '--x', "#{offset.left - root_offset.left}px"
        v_cursor.css '--y', "#{offset.top - root_offset.top}px"
        v_cursor.css '--w', "#{elem.width}px"
        v_cursor.css '--h', "#{elem.height}px"
        v_cursor.add_class 'f-show'
      else
        v_cursor.remove_class 'f-show'
      end
    end
    if elem != @active_elem
      elem.add_class 'f-active' if elem
      @active_elem.remove_class 'f-active' if @active_elem
      @active_elem = elem
    end
  end

  def anchor_elem=(elem)
    if elem != @anchor_elem
      @anchor_elem = elem
      update_selection
    end
  end

  def focus_elem=(elem)
    if elem != @focus_elem
      @focus_elem = elem
      update_selection
    end
  end

  def update_selection
    if @focus_elem && @anchor_elem
      if @focus_elem == @anchor_elem
        self.select_elems = Element[]
        self.active_elem = @focus_elem
      else
        anchor_root = @anchor_elem.parentsUntil(Element['.t-elem, .ed-inner'].has(@focus_elem), '.t-elem').addBack.first
        focus_root = @focus_elem.parentsUntil(Element['.t-elem, .ed-inner'].has(@anchor_elem), '.t-elem').addBack.first
        all_elems = anchor_root.parent.closest('.t-elem, .ed-inner').find('.t-elem:not(:scope .t-elem .t-elem)')
        start_idx, end_idx = [all_elems.index(anchor_root), all_elems.index(focus_root)].sort
        self.select_elems = all_elems.slice(start_idx, end_idx + 1)
        self.active_elem = anchor_root == focus_root ? focus_root : nil
      end
    else
      self.select_elems = Element[]
    end
  end

  def select_elems=(elems)
    @select_elems ||= Element[]
    elems.not(@select_elems).add_class 'f-select'
    @select_elems.not(elems).remove_class 'f-select'
    @select_elems = elems
  end

  def closest_elem(v_node)
    elem = v_node.closest '.t-elem'
    elem.length > 0 and elem.closest(@v_inner.dom_element).length > 0 and elem
  end

  def calc_rect(elem)
    root_offset = @v_overlay.offset
    offset = elem.offset
    {
      x: offset.left - root_offset.left,
      y: offset.top - root_offset.top,
      w: elem.width,
      h: elem.height,
    }
  end

  def ext_inline_editor
    @v_input
  end

  def get_size
    root_offset = @v_overlay.offset
    [@v_input].map { |v|
      offset = v.offset
      [offset.left - root_offset.left + v.outerWidth + 64, offset.top - root_offset.top + v.outerHeight + 64]
    }.reduce([@v_root.outerWidth, @v_root.outerHeight]) { |prev, cur|
      [[prev[0], cur[0]].max, [prev[1], cur[1]].max]
    }
  end

  def push_shortcut(e)
    if active_elem
      node = Native(active_elem.get(0)).node
      node.recv_shortcut(e)
    end
  end

  markup {
    @v_root = div(class: "editor#{shrink ? ' f-shrink' : ''}", tabindex: 0) {
      @v_inner = div(class: 'ed-inner') {
        node_view(node: node)
      }
      @v_overlay = div(class: 'ed-overlay') {
        @v_cursor = div(class: 'i-cursor')
        @v_input = inline_editor
      }
      onpointerdown do |e|
        if e['button'] == 0
          e.stop
          elem = closest_elem(e.target)
          @anchor_elem = elem
          @focus_elem = nil
          update_selection
          self.active_elem = elem
          if elem
            @v_root.dom_element.focus
            Document.on 'pointermove', &handle_pointermove = -> (e) do
              if @anchor_elem && elem = closest_elem(e.target)
                e.stop
                self.focus_elem = elem
              end
            end
            Document.one 'pointerup' do |e|
              if e['button'] == 0
                if @anchor_elem && elem = closest_elem(e.target)
                  e.stop
                  self.focus_elem = elem
                end
                Document.off 'pointermove', &handle_pointermove
              end
            end
          end
        end
      end
      onblur do
        @v_cursor.remove_class 'f-show'
      end
      Document.on 'keydown' do |e|
        if @v_root.is(':focus')
          push_shortcut(e)
        end
      end
    }
  }
end

# Browser::Socket.new 'wss://echo.websocket.org' do
#   on :open do
#     every 1 do
#       puts "ping"
#     end
#   end

#   on :message do |e|
#     $$.console.log "Received #{e.data}"
#   end
# end

def update_win_size
  win_width = $$.innerWidth
  win_height = $$.innerHeight
  editor_width, editor_height = Editor.get_size
  delta_width = (editor_width - win_width).round
  delta_height = (editor_height - win_height).round
  $$.resizeBy(delta_width, delta_height) if delta_width != 0 or delta_height != 0
end

Document.on 'dblclick' do |e|
  update_win_size if e.target == Document.body
end

Editor = nil

@src =
  NodeList.new([
    'Root',
    NodeList.new([
      'Item',
      NodeList.new([
        'Item',
      ]),
      NodeList.new([
        'Item',
        NodeList.new([
          'Item',
        ]),
        NodeList.new([
          'Item',
          NodeList.new([
            'Item',
          ]),
        ]),
        NodeList.new([
          'Item',
        ]),
      ]),
    ]),
    NodeList.new([
      'Item',
    ]),
  ])

Document.ready? do
  Editor = typetree_editor(node: @src, shrink: true)
  update_win_size
  $$.native.show_window true
end
