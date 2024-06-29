require 'browser'

include Glimmer

class NodeBase
  def initialize(data)
    @data = format_data(data)
  end

  def is_valid_data?(data)
    true
  end

  def format_data(data)
    data
  end

  def view
    div
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
end

class NodeList < NodeArray
  def format_data(data)
    if data.any? and ((head = data[0]).is_a?(String) or (head.is_a?(Hash) and head[:text].is_a?(String)))
      data
    else
      ['', *data]
    end
  end

  def view(store)
    root = nil
    div(class: 'n t-elem') { |elem|
      ondblclick do |e|
        e.stop_propagation
        elem.trigger('request_input', [elem])
      end
      store[:head] = div(head_text, class: 'n t-atom s-label f-primary')
      root = div(class: 'n t-layout s-box f-dir-vertical') { yield }
    }
    root
  end

  def inner
    @data.drop(1).each do |n|
      node_view(node: n)
    end
  end

  def head_text
    if (head = @data[0]).is_a?(String)
      head
    else
      head[:text]
    end
  end
end

@src =
  NodeList.new([
    'Root',
    NodeList.new([
      'Item',
    ]),
  ])

class NodeView
  include Glimmer::Web::Component

  option :node
  option :inner
  option :store, default: {}

  markup {
    @root = node.view(store) { node.inner }
  }
end

class Editor
  include Glimmer::Web::Component

  options :node, :cursor
  option :shrink, default: false

  attr_reader :active_elem, :anchor_elem, :focus_elem

  def active_elem=(elem)
    @v_cursor.get_animations[0]&.currentTime = 0
    if elem != @active_elem
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
        anchor_root = @anchor_elem.parentsUntil(Element['.t-elem, .editor'].has(@focus_elem), '.t-elem').addBack.first
        focus_root = @focus_elem.parentsUntil(Element['.t-elem, .editor'].has(@anchor_elem), '.t-elem').addBack.first
        all_elems = anchor_root.parent.closest('.t-elem, .editor').find('.t-elem:not(:scope .t-elem .t-elem)')
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
    # elems = Element[] if elems.length == 1
    elems.not(@select_elems).add_class 'f-select'
    @select_elems.not(elems).remove_class 'f-select'
    @select_elems = elems
  end

  def closest_elem(v_node)
    elem = v_node.closest '.t-elem'
    elem.length > 0 and elem.closest(@v_root.dom_element).length > 0 and elem
  end

  markup {
    @v_root = div(class: "editor#{shrink ? ' f-shrink' : ''}", tabindex: 0) { |v_root|
      node_view(node: node)
      @v_overlay = div(class: 'ed-overlay') {
        @v_input = textarea(class: 'i-input', spellcheck: false)
        @v_cursor = div(class: 'i-cursor')
      }
      onpointerdown do |e|
        if e['button'] == 0
          e.stop_propagation
          elem = closest_elem(e.target)
          @anchor_elem = elem
          @focus_elem = nil
          update_selection
          self.active_elem = elem
          if elem
            @v_root.dom_element.focus
            Document.on 'pointermove', &handle_pointermove = -> (e) do
              if @anchor_elem && elem = closest_elem(e.target)
                e.stop_propagation
                self.focus_elem = elem
              end
            end
            Document.one 'pointerup' do |e|
              if e['button'] == 0
                if @anchor_elem && elem = closest_elem(e.target)
                  e.stop_propagation
                  self.focus_elem = elem
                end
                Document.off 'pointermove', &handle_pointermove
              end
            end
          end
        end
      end
      v_root.on 'request_input' do |e, elem|
        if v_input = @v_input.dom_element
          if elem
            root_offset = @v_overlay.offset
            offset = elem.offset
            v_input.css '--x', "#{offset.left - root_offset.left}px"
            v_input.css '--y', "#{offset.top - root_offset.top}px"
            v_input.css '--w', "#{elem.width}px"
            v_input.css '--h', "#{elem.height}px"
            v_input.add_class 'f-show'
            v_input.focus
          else
            v_input.remove_class 'f-show'
          end
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
  editor_width = @editor.outerWidth
  editor_height = @editor.outerHeight
  delta_width = editor_width - win_width
  delta_height = editor_height - win_height
  $$.resizeBy(delta_width, delta_height)
end

Document.on 'dblclick' do |e|
  update_win_size if e.target == Document.body
end

Document.ready? do
  @editor = editor(node: @src)
  update_win_size
  $$.native.show_window true
end
